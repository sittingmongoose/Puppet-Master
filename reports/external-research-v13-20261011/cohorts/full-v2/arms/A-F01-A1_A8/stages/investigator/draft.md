# Draft proposal — disconnected field-survey edit journal

## Recommendation

Treat the journal as the product's durable, application-owned record of edits and make the embedded database, network relay, and removable-media bundle interchangeable storage and transport choices around that record. An observation row is a current projection; it is not the only copy of the user's work. Give each observation a stable ID, each operation a globally unique ID and durable origin identity/sequence, and record causal context so replay can distinguish independent changes from competing changes. Preserve competing operations and make explicit resolution a new operation.

SQLite is a reasonable first local-store prototype, not a committed engine choice. It can atomically update the event log, materialized observation, and local sequence in one transaction; WAL with FULL synchronization is the stronger documented SQLite setting for committed transactions at power-loss boundaries. The Session extension is an optional row-delta facility, not the proposed domain journal. Keep the prototype behind a storage interface and compare it against an Automerge/CRDT document prototype and a CouchDB revision-tree/replication prototype before selecting a dependency. The present evidence does not establish that any candidate meets this application's integration, deployment, retention, and operator needs. Sources: [SQLite WAL (S03)](https://www.sqlite.org/wal.html), [SQLite synchronous pragma (S04)](https://www.sqlite.org/pragma.html), [SQLite Session introduction/API (S01, S02)](https://www.sqlite.org/sessionintro.html), [Automerge conflicts (S07)](https://automerge.org/docs/reference/documents/conflicts/), [CouchDB conflict handling (S14)](https://docs.couchdb.org/en/stable/replication/conflicts.html).

Do not let a database's deterministic winner, transfer arrival order, author display label, or wall clock choose the value the operator sees as final. Independent field edits may be merged when causal history proves they are independent. Same-field competition and delete-versus-edit must remain reviewable. A photo addition that races with a delete must never recreate the observation silently. Keep photo bytes outside ordinary sync and transfer them only after an explicit operator action.

## Per-clause disposition of the released plan

Each block quote is copied from the released plan. Disposition labels distinguish a correction needed for the brief's safety requirements from an optional improvement and an owner decision.

### Paragraph 1

> The draft uses a transactional embedded store for observations and a second append-only journal carrying operation identifiers, author labels, and per-record revision numbers.

**Disposition — retain the two logical responsibilities; correct the identity and atomicity contract; owner decision on engine.** An embedded store is a feasible local design. Prefer one transactional commit that writes the immutable operation, current projection, and origin sequence together. If the journal is physically separate, it needs an explicit durable outbox/recovery protocol; do not describe two unrelated writes as atomic. A user-facing author label is descriptive, not unique identity. Add a stable device-instance ID, an installation epoch that changes after reinstall/clone/restore where necessary, a monotonically increasing sequence within that epoch, a unique operation ID, and causal parent/frontier or equivalent known-base reference. Preserve the payload and source IDs for every operation. A per-record revision can help detect a stale base, but it does not by itself identify an operation or say whether two revisions are concurrent. SQLite Session changesets are constrained row deltas, can coalesce repeated edits, and can omit reverted edits; they therefore cannot replace this application history. [S01](https://www.sqlite.org/sessionintro.html), [S02](https://www.sqlite.org/session.html).

> Photos remain in a directory selected by the operator; journal entries hold relative references and hashes.

**Disposition — retain separation and explicit operator choice; correct the reference manifest; owner decision on path semantics.** Do not place photo bytes in ordinary journal segments or sync documents. A reference should include a stable attachment ID, the observation and incarnation it belongs to, original external link, hash algorithm and digest when available, byte length, MIME type, and per-device availability. A relative path plus hash alone can become ambiguous when the selected directory moves, a filename is reused, or bytes are unavailable. Hashing detects a mismatch; it does not copy or guarantee availability. Keep the observation intact if a link is missing. If the user explicitly chooses media transfer, package and verify the bytes separately and report missing/changed files. Decide whether links remain external paths or are copied into app-managed storage, how paths are remapped across laptops, and how orphaned media is retained. CouchDB attachment metadata/stubs do not imply that a replicator will avoid sending the bytes; configuration and document shape must enforce the no-automatic-upload rule. [S16](https://docs.couchdb.org/en/stable/api/document/common.html).

> Each laptop exchanges journal segments through a relay on the office network, with removable-media bundles as a fallback.

**Disposition — retain as a feasible transport, with an owner decision about relay operation.** Three laptops can use the same versioned event/bundle format through a LAN relay or removable media. The relay must not become the source of semantic ordering or conflict policy. Since a laptop may be away for a week and the network can be unavailable, removable exchange must remain capable of carrying a complete, resumable package without the relay. A package should include a bundle ID, schema/version, sender replica and sequence/frontier, operation IDs and causal context, checksums, and optional explicitly selected media. Import the exact same package idempotently whether it arrived by relay or disk. CouchDB supports push and pull replication with resumable checkpoints, but that is one transport/product candidate, not a requirement for a hosted account. [S15](https://docs.couchdb.org/en/stable/replication/intro.html).

> Nothing requires a hosted account.

**Disposition — retain as a hard constraint.** A local office relay or direct/manual transfer may be proposed, but account creation or external hosting must not be a prerequisite for recording, review, recovery, or transfer. State clearly if a future optional relay requires local setup. No photo content should be uploaded automatically, whether or not a hosted service is used.

### Paragraph 2

> For now, the relay accepts operations in arrival order.

**Disposition — correct.** Arrival order may control when a relay queues or forwards data; it is not a causal order and must not select a winner. Preserve each event's origin sequence and causal parents/frontier. Concurrent events remain concurrent regardless of which laptop reconnects first. A receiver may apply known causal predecessors before dependants, buffer an event whose prerequisites are missing, and replay it later. Do not rewrite the origin event to make the relay's arrival order look authoritative.

> A revision mismatch opens a conflict card showing the old value and both edits.

**Disposition — retain the review surface; improve its detection and content.** A mismatch is a useful stale-base signal but needs the event's declared base/frontier to determine whether edits truly conflict. The card should show the field, value at the shared base when known, every current competing value, the record/site identifier, and originating laptop/person label. It should say why review is needed. Preserve more than two alternatives if more than two edits accumulated. Choosing a value creates a resolution event that references the competing operation IDs; it must not erase their recoverable history. Automerge is instructive here: ordinary property access selects a deterministic operation-ID winner while its conflict API exposes competing values, so a hidden/default read cannot stand for user approval. [S07](https://automerge.org/docs/reference/documents/conflicts/), [S08](https://github.com/automerge/automerge/blob/js/automerge-3.4.1/javascript/src/implementation.ts).

> Nonoverlapping field edits are proposed for automatic merging, while delete-versus-edit is routed to review.

**Disposition — retain with an explicit field-level rule; extend to photo-add/delete.** Automatically combine edits to different fields only when their histories establish a common base and the edits do not invalidate one another. Concurrent updates to the same field require review. A tombstone is a durable operation targeting a particular observation incarnation, not a missing row that can be recreated by a stale update. Route delete-versus-note/confidence/site edit and delete-versus-photo-add to review. An incoming photo reference must remain pending or unlinked while the deletion decision is unresolved. Keeping the deletion must leave the observation deleted; restoring it requires an explicit restore operation linked to the tombstone. The application should preserve the incoming photo reference as a recoverable choice without restoring the record.

> The draft assumes that laptop-local revision numbers plus an author label uniquely identify operations, and that acknowledgment permits discarding sent segments.

**Disposition — reject both assumptions pending a durable identity/acknowledgment contract.** A revision counter can restart, collide after a cloned database, or be shared by more than one event; a person/author label can change or be duplicated. Use persistent replica identity plus epoch and per-origin sequence, and a unique idempotency key for each operation. Define clone/reinstall/restore behavior and test it. A receiver should validate the package, atomically store events, update the materialized view and durable import cursor, synchronize according to the selected engine's policy, then acknowledge the imported frontier. If the acknowledgment is lost, the sender resends the same IDs and the receiver treats them as duplicates. Do not discard sent segments merely because a relay acknowledged them if other active laptops have not durably received them. Permit compaction only after a defined set of replicas has acknowledged a verified snapshot and retained event tail. Whether the office relay is itself a durable replica, and which replicas must acknowledge before local pruning, are owner decisions.

> Whether either assumption survives reinstall, lost acknowledgments, and interrupted transfer is unresolved.

**Disposition — resolve as an engineering obligation before network integration.** Specify identity epoch rotation and idempotent replay before authoring the importer. Include lost acknowledgment and crash-after-commit/before-ack as normal restart cases. After a crash before batch commit, the cursor must not advance and replay must succeed; after commit but before acknowledgment, duplicate replay must not duplicate an edit or photo reference. Interrupted bundles must be resumable or safely rejected without partial cursor advancement.

> Wall-clock timestamps are display information, not a winner rule.

**Disposition — retain.** This directly satisfies the no-wall-clock winner constraint. Timestamps can be shown as approximate context but must be labeled as device-reported and non-authoritative because laptop clocks can differ. Use causal metadata and explicit review instead.

### Paragraph 3

> Save and journal append should appear atomic to the application.

**Disposition — strengthen into a testable invariant.** A successful save commits the operation, current projection, and local sequence together. A failed or interrupted save leaves either all of that state committed or none of it, and restart exposes the last committed state. If SQLite is selected, WAL with synchronous=FULL is a stronger documented local baseline than NORMAL for power-loss durability, with the WAL sidecar kept with the live database. This remains conditional on the operating system, filesystem, and device honoring synchronization. SQLite WAL is a same-host facility, not a multi-laptop shared-file protocol. [S03](https://www.sqlite.org/wal.html), [S04](https://www.sqlite.org/pragma.html).

> The draft has not yet selected one database transaction or a coordinated file protocol, and attachment copying remains an explicit action.

**Disposition — retain the engine decision for a bounded prototype; correct the storage boundary.** First try one transaction for journal, projection, and cursor in the candidate local store. For media, do not claim a cross-resource atomic transaction: write to a temporary path, flush and verify, publish it atomically if the platform supports that, then commit its reference; on recovery, detect unreferenced temporary files and missing referenced files without deleting the observation. Use the SQLite Online Backup API for a consistent snapshot of a live SQLite database rather than copying only its main file; snapshots still do not merge two laptops. [S05](https://www.sqlite.org/backup.html).

> It proposes a retention setting for resolved conflicts but leaves recovery after retention open.

**Disposition — do not ship a retention control without a recovery rule; owner decision on long-term period.** A resolved conflict remains part of the competing-edit history and should be viewable with the chosen resolution. The pilot should retain season operations and tombstones, with no automatic removal of unresolved alternatives and no event compaction while an active laptop may be a week behind. Define a verified snapshot, acknowledged replica frontier, backup check, and recovery horizon before pruning. Retention beyond the season and any legal/archive requirements are user-data decisions. CouchDB's revision tree is not sufficient evidence of application history because compaction/pruning can remove non-leaf bodies. [S14](https://docs.couchdb.org/en/stable/replication/conflicts.html), [S17](https://docs.couchdb.org/en/stable/best-practices/documents.html).

> Validation would replay duplicate segments, interrupt saves, reconnect after competing deletion and photo addition, and restore a copied store.

**Disposition — retain and expand as proposed validation.** The copied-store restore case should use a database-consistent backup and should verify the event log, projections, cursors, tombstones, and media manifest. Add network loss, reordered/partial segments, lost acknowledgment, receiver restart at each import boundary, duplicate import after resolution, stale schema, corrupt bundle, missing media, full disk, read-only directory, device reset/clone, long-offline replay, and another edit after a conflict resolution. Include two devices making independent-field and same-field edits, plus a third laptop joining after a week. Validate that none of these silently chooses a user value or resurrects a tombstoned observation. These are plans; no such checks were run in this stage.

> No checks have been run.

**Disposition — retain this as an accurate status for the provisional draft; clarify stage status below.** This investigator retrieved primary documentation, tagged source, and upstream issue/PR/release history. It did not run the application, project tests, executable witness, crash tests, or benchmark. Upstream PR checks are attributed only to upstream (S19), not to this work.

> A staged proposal should settle identity and durability before adding convenient merge behavior.

**Disposition — retain and make the sequence concrete.** Establish identity, delete/restore semantics, transaction boundaries, and recovery first; only then add automatic disjoint-field merge and the review UI. Do not describe automatic merge as a shortcut around recovery guarantees.

### Paragraph 4

> This is a provisional draft for review after the declared reveal, not an endorsed answer.

**Disposition — retain.** The current document is a researched proposal for review, not a product decision or deployment authorization.

> Resolve material assumptions through applicable primary evidence; retain open user-data questions when they cannot be answered from sources.

**Disposition — retain.** The source evidence narrows implementation behavior but cannot decide retention, field immutability, how to interpret duplicate ecological observations, media path portability, or who may approve a restore. Those remain owner decisions listed below.

> No future product deployment is requested.

**Disposition — retain as a scope limit.** This draft proposes architecture and validation; it does not deploy or modify the existing application.

## Complete brief coverage and proposed design

### Records and identity
The current view must cover site identifier, observation note, confidence flag, and external photo links. Keep observation identity independent of site identifier and path. For each operation store at least: operation ID, replica/device-instance ID, installation epoch, per-origin sequence, actor display label, affected observation/incarnation, operation type/field payload, causal parents or base frontier, schema version, and informational device timestamp. Keep site ID editable only if the owner confirms it is; never use it as a record key. Create a resolution operation that cites all alternatives and the selected/combined value.

### Local save and reconnect recovery
For each local save, commit operation + projection + sequence atomically. A durable import similarly commits validated operations + projections + receiver cursor atomically. Acknowledge only after the selected engine has durably committed. On replay, deduplicate by operation ID and verify that a duplicate ID has the same content; a same-ID/different-content package is a hard integrity error. Do not advance a cursor or discard the sender's last copy when an operation was only partially read or staged.

If SQLite is selected, qualify the exact embedded version and compile options; the Session extension requires SQLITE_ENABLE_SESSION and SQLITE_ENABLE_PREUPDATE_HOOK and has primary-key/table restrictions. WAL is local to one host, and FULL synchronization affects local commit durability but cannot repair a filesystem/device that lies about flushes. The SQLite Backup API is the documented consistent snapshot mechanism. [S01–S06](sources/index.md#sqlite).

### Alternatives and trade-offs

| Approach | Useful fit | Material conditions and gaps | Current disposition |
|---|---|---|---|
| SQLite plus application-owned journal | Small local embedded store; one transaction can bind event, projection, and cursor; can support consistent snapshots | Session extension is compile-time optional, PK/table constrained, and coalesces edits. WAL is same-host only. It does not provide multi-replica semantic merge. Pin binary/options and test real power-loss behavior. [S01–S06](sources/index.md#sqlite) | First local-store prototype, not final choice |
| Automerge/CRDT documents | Offline changes can converge; separate fields and concurrent values have an explicit conflict API | Deterministic ordinary read still selects a winner; application must display/resolve conflicts. JS v3.4.1 is the version inspected; Rust ergonomics/parity and object-lineage reports need version-specific tests. Issues 526 and 889 do not establish a v3.4.1 defect. [S07–S13](sources/index.md#automerge) | Prototype as merge alternative; do not assume binding parity |
| CouchDB revision-tree replication | Push/pull, resumable checkpoints, tombstones, conflict leaves; optional local relay can avoid mandatory hosted account | Ordinary reads hide losing leaves; revision history can be pruned; attachments may transfer; exact package version matters. PR 6129 fixed a delete/recreate attachment revision bug upstream, but merged main/notes do not prove the installed package contains it. [S14–S21](sources/index.md#couchdb) | Evaluate only with exact package pin and delete/recreate regression test |
| Manual journal bundle | Works with removable media and no network; enables explicit media choice | Requires same idempotent importer, version validation, checksum, partial-transfer handling, and durable cursor rules. Raw file copy/overwrite is not a merge. | Required fallback transport regardless of network choice |

The evidence supports comparing these approaches, not a product winner. A full-file overwrite is rejected as a merge protocol. A raw live SQLite main-file copy is rejected as a snapshot procedure. CouchDB revision winning and Automerge deterministic property reads are rejected as operator decisions. SQLite changesets alone are rejected as the durable event-history contract.

### Photo/reference behavior
Journal photo operations should describe a reference, not carry its content. A reference is local or share-relative only if its namespace and portability are explicit. Track states such as available, missing, changed, pending transfer, or unlinked per device rather than assuming every laptop can open the same path. A media transfer manifest carries attachment ID, original and target reference, expected hash/length/MIME when known, and the selected destination. Verify content before marking it available. Never auto-copy all photos during sync. A missing attachment must not invalidate a note or confidence value.

For delete/photo-add overlap, preserve the delete tombstone and the new reference as separate history. Show a review that makes deletion state visible. The operator can keep deletion and leave/archive the photo separately, or explicitly restore the observation and attach the photo. The incoming photo cannot automatically restore the observation. Whether restoration creates a new incarnation and whether keeping deletion deletes or retains a photo file are owner decisions; do not delete the only photo copy during conflict resolution.

### Operator-facing explanation
Suggested compact prompt:

> Two laptops changed this observation while disconnected. One marked it deleted; the other added a photo. The photo has not restored the observation and no photo contents were sent. Keep the deletion and leave the photo separate, or explicitly restore the observation with the photo?

For ordinary field conflicts, show the field name, shared/base value if known, all competing values, site/observation ID, originating laptop/person labels, and an explicit choice or combined value. Say “needs review” and explain the cause; do not show a database error, treat the first arrival as correct, or imply that a selected deterministic value was approved.

## Bounded integration sequence

1. **Set product semantics.** Agree on editable fields, site-ID rules, duplicate-observation handling, actor/device labels, delete/photo behavior, explicit restore, media paths, and retention. Write examples for same-field, independent-field, and delete/add cases.
2. **Compare small prototypes.** Use the same scripted operation cases against SQLite plus app-owned journal, Automerge, and (if the relay is acceptable) CouchDB. Record versions, compile flags, package/deployment burden, merge results, migration and recovery limits. Do not build the UI around an unverified winner rule.
3. **Prove local durability and recovery.** Select one embedded engine only after a save/journal transaction, backup/restore, schema migration, device reset, and crash-boundary prototype meets invariants. Keep the data contract transport-neutral.
4. **Deliver manual package exchange first.** Make one versioned, checksummed, idempotent import/export format. Test interrupted and repeated transfer with removable media. Add optional media only by explicit selection and separate manifest.
5. **Add network transport.** Let a LAN relay or chosen sync product carry the same operations/packages. Make checkpoints per replica, require durable acknowledgments, and retain sender history while any required laptop is behind. Keep network absence and week-long offline behavior ordinary.
6. **Add review and recovery UI.** Present conflicts and recovery in plain terms, link each decision to its operations, and let operators inspect the alternatives later.
7. **Pilot and qualify scale.** Test on copies and representative hardware, then benchmark 50,000 observations with real-shaped notes, expected indexes, and realistic variation in attachment sizes/link rates. The brief does not provide media sizes or throughput, so no capacity or sync-time claim can yet be made.

## Validation plan — proposed, not executed

| Failure or scenario | Proposed exercise | Required result |
|---|---|---|
| Power loss while editing note/confidence/site ID | Inject abrupt termination before transaction, during commit, and after reported commit; restart and inspect event, projection, and sequence | State is wholly before or wholly after the save; no torn partial edit; status shown accurately |
| Crash after receive commit but before acknowledgment | Re-import same bundle after restart | One logical copy; durable cursor and projection agree; duplicate is safely acknowledged |
| Crash before import commit or while transfer is partial | Truncate package or stop import at each batch boundary | No cursor advancement for uncommitted work; resume/reject safely; source can resend unchanged IDs |
| Two laptops edit same observation | Concurrent different-field edits and same-field edits from a shared base, then exchange in both orders | Disjoint fields merge only where safe; competing values remain visible; replay order has no winner effect |
| Delete versus edit/photo-add | Independently delete and edit note, change confidence, or add a photo; exchange from a one-week-offline third laptop | Tombstone is not silently removed; photo/edit stays reviewable; explicit restore is required |
| Lost identity state/reinstall/clone | Reinstall, restore backup to second machine, clone local data; then create and exchange operations | Epoch/identity policy avoids ID collision or duplicate authorship; reset is visible and recoverable |
| External media mismatch | Missing path, changed bytes under same filename, corrupt copy, incomplete optional media transfer | Note survives; status identifies missing/changed media; hash/length checks prevent false “available” |
| Bad or old bundle | Wrong checksum, unsupported schema, duplicate ID with altered body, reordered/cross-epoch events | Reject or quarantine with an explanation; do not partially advance cursor or silently overwrite |
| Disk/storage/permission failures | Full disk, read-only database or directory, WAL sidecar missing during unsafe copy, failed flush | Surface failure before claiming success; preserve previous committed state; recovery path is documented |
| Snapshot/retention/long offline | Restore a consistent snapshot, exchange after seven offline days, resolve a conflict, then inspect history | Competing edits and tombstones remain recoverable; compaction does not discard state required by a lagging replica |
| Scale/network envelope | Benchmark 50,000 observations, representative text/indexes, parameterized media sizes and link rates | Measure load/save/import/export and storage; set limits only after assumptions are agreed |

No app, project test suite, executable witness, crash test, or benchmark ran in this stage. S09 names an upstream JavaScript package test command but it was not executed. S19's reported upstream checks are not local verification. The reveal helper ran once after discovery/source-map save; it froze discovery SHA-256 de27915be2aa0161163c5bc8dea37dbd95855ba01bd4b291de4366950788227a and released the plan copy used above. The discovery file was not changed after release.

## Owner decisions still open

- Is site identifier immutable or editable, and how are duplicate ecological observations recognized without using the site ID as the row key?
- Which fields can merge independently, and what counts as a meaningful conflict for confidence flags and notes?
- On delete/photo-add, can an operator retain the photo separately, restore a record with a new incarnation, or both? Who is allowed to resolve it?
- Are photo links laptop-local paths, a shared office directory, or externally managed URIs? Should operators ever copy selected media into application-managed storage?
- Which replicas must acknowledge before compaction, does the relay count as a durable replica, and what is the season/archive retention horizon?
- Is a continuously available office LAN relay acceptable, or is removable exchange the sole guaranteed path?
- What operating systems and filesystems must pass the power-loss tests? Which database, language, packaging, and support burden fit the existing desktop application?
- What actual attachment-size and link-speed range should the 50,000-observation performance target cover?

Until these are answered, the proposal deliberately leaves the storage engine and exact sync product open while requiring stable identity, idempotent replay, explicit conflict resolution, crash recovery, removable-media exchange, and no automatic photo upload as invariants.
