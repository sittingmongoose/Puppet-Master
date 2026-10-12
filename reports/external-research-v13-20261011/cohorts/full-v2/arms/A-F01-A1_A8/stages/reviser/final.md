# Final proposal — disconnected field-survey edit journal

## Decision and scope

Treat edits as a durable, application-owned event history with a current observation view derived from it. Keep local storage, network relay, and removable-media transfer as replaceable implementation and transport choices around the same event/package contract. Preserve competing edits and require an explicit resolution operation. The evidence supports a bounded comparison, not selection of SQLite, Automerge, or CouchDB as the product winner.

This is a proposal, not implementation or deployment authorization. The brief describes three laptops, up to seven days offline, up to 50,000 seasonal observations with site IDs, notes, confidence flags, and links to separately stored photos. Photo sizes, link speeds, app language, storage engine, OS, and filesystem are unknown. No hosted account is required, photo bytes are not transferred automatically, wall clocks do not decide winners, removable-media exchange remains possible, and reconnect must not silently resurrect a deleted observation.

One material integration input is absent: the input map provides no existing application repository, callers, schema, or tests. I did not inspect paths outside the assigned input map. The current application’s save/read paths, IDs, photo-link handling, migrations, callers, and tests therefore remain unexamined. Obtain that repository and inspect those paths before treating any candidate as integration-ready. This limitation does not prevent a transport-neutral data and recovery proposal.

## Evidence adjudication

### SCW-01 — SQLite transaction and power-loss setting — ACCEPT, WITH SCOPE

A transaction in one SQLite database can bind the event, materialized observation, and origin sequence. WAL with synchronous=FULL is the stronger local durability baseline here: SQLite’s WAL page says FULL syncs each commit, while its PRAGMA documentation says NORMAL can roll back a just-committed WAL transaction after system crash or power loss. SQLite’s atomic-commit assumptions still depend on the VFS, OS, filesystem, and storage device honoring flushes. This does not make a physically separate journal, media file, attached database set, or remote replica part of the same atomic transaction. Use one database transaction for event, projection, and sequence; if separate files are unavoidable, specify and test an outbox/recovery protocol. Sources: [S03 WAL](https://www.sqlite.org/wal.html), [S04 synchronous](https://www.sqlite.org/pragma.html), [S23 atomic-commit assumptions](https://www.sqlite.org/atomiccommit.html).

### SCW-02 — CouchDB PR 6129 release scope — AMEND

The official CouchDB 3.5.x release notes list PR 6129 under Version 3.5.3 and say same-name attachments recreated after document deletion will replicate from source to target. The PR was merged upstream as 83a487b on 2026-09-25 and describes attachment revision positions left at 1 instead of 3. Thus the evidence supports inclusion in the upstream 3.5.3 release; it does not identify the group’s future packaged/deployed server. Pin the exact distribution/build and reproduce delete/recreate plus same-name attachment replication before selecting CouchDB. Sources: [S18 PR 6129](https://github.com/apache/couchdb/pull/6129), [S20 CouchDB 3.5 release notes](https://docs.couchdb.org/en/stable/whatsnew/3.5.html).

### SCW-03 — Automerge language surface — RETAIN JAVASCRIPT FINDING; RETAIN UNCERTAINTY FOR RUST

For the inspected JavaScript package/tag v3.4.1, ordinary access to a concurrently assigned property selects one deterministic value; the conflict API exposes the other value(s). This is not operator approval. The tagged JS implementation and conflict guide support that statement. The Rust core/mapping candidate does not establish that its exact API has the same read and conflict-enumeration behavior. Do not claim a Rust defect or parity: prototype and test the selected Rust version before relying on it. Issue 526 concerns nested object/array reassignment with v3.4.1 applicability unverified. Issue 889 names @automerge/automerge 2.1.11; the critic’s current GitHub observation says it was closed and converted to a discussion on 2026-09-10. That status correction does not establish a v3.4.1 defect. Sources: [S07 conflicts guide](https://automerge.org/docs/reference/documents/conflicts/), [S08 tagged v3.4.1 JS implementation](https://github.com/automerge/automerge/blob/js/automerge-3.4.1/javascript/src/implementation.ts), [S11 Autosurgeon](https://github.com/automerge/autosurgeon), [S12 issue 526](https://github.com/automerge/automerge/issues/526), [S13 issue 889](https://github.com/automerge/automerge/issues/889).

### SCW-04 — WAL topology — ACCEPT

SQLite WAL requires processes accessing that database to be on the same host; it is not a three-laptop shared network-file protocol. SQLite can still be a laptop-local store while a relay or event package carries data between replicas. Sources: [S03 WAL](https://www.sqlite.org/wal.html), [S23 atomic-commit assumptions](https://www.sqlite.org/atomiccommit.html).

### SCW-05 — CouchDB default reads and conflict bodies — AMEND THE REVIEW PATH

A basic CouchDB document GET returns only the deterministic winner and gives no indication of other conflicting revisions. A conflicts=true response identifies losing revision IDs; it does not itself return all losing bodies. open_revs=all retrieves the leaf revision documents, including deleted leaves that the app may filter from its current-choice display. Requested bodies can be missing after compaction. A review card must fetch and preserve the relevant available bodies, handle missing/pruned history honestly, and must not treat the deterministic winner as approval. This is a material qualification of the candidate’s review path, not grounds to reject CouchDB without a pinned test. Source: [S14 conflict handling](https://docs.couchdb.org/en/stable/replication/conflicts.html).

### SCW-06 — Embedded attachments versus external references — ACCEPT, WITH BOUNDARY

CouchDB’s ordinary document API returns attachment summaries/stubs without the attachment data, and the replication protocol describes transferring attachment bodies that belong to replicated documents. A stub does not promise that replication omits embedded attachment bytes. Conversely, the protocol evidence does not say that CouchDB follows an application-level external URI and fetches those external photo bytes. Keep bytes outside replicated CouchDB documents to avoid implicit attachment replication, and separately ensure application code does not fetch/upload external references automatically. Sources: [S16 attachment API](https://docs.couchdb.org/en/stable/api/document/common.html), [S22 replication protocol](https://docs.couchdb.org/en/stable/replication/protocol.html).

### Ordinary critique disposition

The full brief remains controlling. All constraints are preserved: three laptops and week-long disconnection; 50,000 observations without invented performance promises; separate photo references; durable recovery; competing edit review; delete/photo no-resurrection; no hosted account; opt-in media transfer; no wall-clock winner; manual transfer; bounded integration; failure-oriented proposed validation. Research is primary-source based for the surveyed implementations and includes code/release/issue history where represented by the input packet. No local app, its callers, or its tests were available in the packet, so that research obligation remains an explicit open integration input, not a claim of completed inspection. No proposal validation below is represented as run.

## Proposed data and recovery contract

### Identity and operations

Give each observation a stable UUID independent of site ID, display order, and file path. Give each operation an immutable unique ID and record at least: replica/device-instance ID, installation epoch, monotonically increasing sequence within that epoch, actor display label, affected observation and incarnation, operation type/field payload, schema version, causal parents/frontier or equivalent known-base reference, and informational device timestamp. Actor labels are descriptive, not unique keys. Define what reinstall, cloned/restored databases, and lost identity state do; rotate or re-establish an epoch so cloned writers cannot silently claim the same sequence space.

A per-record revision can signal a stale base, but it is not an operation identity and does not establish causality. Preserve the original operation payload and lineage. On import, deduplicate by operation ID and verify the content matches; the same ID with different content is an integrity error. Accept reorder and replay. Apply causal predecessors before dependants when available, buffer or report missing prerequisites, and never rewrite origin events to make relay arrival order appear authoritative.

### Local writes, import, acknowledgments, and retention

For a local save, commit the immutable event, materialized view, and local sequence in one database transaction. For import, validate the envelope first, then atomically commit accepted events, projection changes, and the durable import cursor. Acknowledge only after the selected engine’s configured durability boundary. If the acknowledgment is lost, sender retries the same IDs and receiver treats them as duplicates. A crash before import commit must not advance the cursor; a crash after commit but before acknowledgment must be safely replayable.

Do not discard the sender’s last copy merely because a relay acknowledged receipt. Define which active replicas must durably receive a verified snapshot before compaction; a laptop may be absent for a week. Decide whether the relay is itself a durable replica. Preserve unresolved alternatives and tombstones. A resolved conflict remains inspectable with its selected resolution. Do not ship a retention control without a recovery rule. Season retention is a pilot default proposal only; retention beyond a season, legal/archive needs, eligible replica set, and safe compaction frontier are owner decisions.

### Conflicts and deletion

Merge independent field edits only when causal metadata establishes a common base and the changes do not invalidate each other. Concurrent changes to the same field remain competing alternatives. A transport/database deterministic winner, first arrival, author label, and wall-clock timestamp are never a user decision.

Represent deletion as a durable tombstone for a particular observation incarnation. Delete-versus-note, delete-versus-confidence/site edit, and delete-versus-photo-add all require review. A concurrent incoming photo reference remains pending or unlinked; it cannot restore the observation. The operator may keep deletion and retain/archive the photo separately, or issue an explicit restore linked to the tombstone and deliberately attach the photo. Decide whether restore reuses an ID or creates a linked incarnation, who may approve it, and whether keeping deletion affects a photo file; conflict handling must never delete the only photo copy.

### Photo references and transfer

Keep photo content outside ordinary observation sync. A reference should carry a stable attachment ID, observation/incarnation association, original external link, hash algorithm and digest when available, byte length, MIME type, and per-device availability. Track states such as available, missing, changed, pending transfer, and unlinked. A relative path plus hash may not survive a directory move, filename reuse, or unavailable media; a hash detects mismatch but does not guarantee availability. Missing media must not erase an observation or its note/confidence.

Transfer selected media only through a separate, explicit manifest and action. Include expected hash/length/MIME when known and target reference; verify before declaring it available. Stage to a temporary path, flush and verify, publish atomically when the platform permits, then commit the reference. Recovery must handle both unreferenced staged files and referenced-but-unavailable external files. Never auto-copy/upload photos. Decide whether to preserve external paths or copy selected files to app-managed storage, how laptops remap paths, and how orphaned photos are retained.

### Local-store and transport alternatives

| Candidate | Fit and limits | Disposition |
|---|---|---|
| SQLite plus application-owned journal | A small laptop-local embedded store; one transaction can bind event, projection, and sequence. WAL+FULL is a stronger documented local baseline if the exact build/configuration is verified. Keep WAL state with the live database. WAL is same-host only. FULL cannot overcome a filesystem/device that lies about flushes. The Session extension is optional (SQLITE_ENABLE_SESSION and SQLITE_ENABLE_PREUPDATE_HOOK), tracks tables with declared primary keys and has compatibility/conflict-handling constraints; repeated edits can coalesce and reverts disappear. It is a row-delta aid, not domain history or policy. Online Backup API gives a consistent live snapshot, not replica merge. [S01–S06, S23](source-map.json) | First local-store prototype, not a committed engine |
| Automerge/CRDT documents | Candidate offline merge model; independent properties can merge and concurrent property values can remain available through a conflict API. Ordinary reads in the inspected JS v3.4.1 surface select a deterministic value. Delete/media and operator review remain application policy. Rust mapping/version parity and nested-object history must be tested directly. Issues 526 and 889 do not establish a current JS defect. [S07–S13](source-map.json) | Prototype as a merge alternative; no unverified Rust parity claim |
| CouchDB revision-tree replication | Push/pull, checkpoints, tombstones, conflict leaves, and possible local relay. Ordinary GET hides losing leaves; conflicts=true shows IDs, open_revs fetches bodies; compaction may leave requested history missing. Revision history is not an application audit log. Embedded attachments can transfer. Upstream 3.5.3 includes PR 6129, but the actual package is unknown. [S14–S22](source-map.json) | Evaluate only with exact package pin and regression tests |
| Manual versioned journal bundle | Works with removable media and no network; same importer can be used by relay and disk. Requires schema/version validation, bundle ID, checksums, source replica/frontier, operation IDs/causality, duplicate suppression, resumable or safely rejectable partial transfer, and transactional cursor advancement. Raw database overwrite or live main-file copy is not merge. | Required fallback transport independent of network choice |

CouchDB’s replication API is a candidate transport, not a hosted-account requirement. An office LAN relay or direct removable exchange can be considered. The relay queues/forwards data but never supplies semantic order. Any chosen relay must have an explicit durability, availability, and replica-acknowledgment policy. Make its setup optional if it is not guaranteed to be available. A future product decision should compare packaging burden, migration, recovery, operator comprehension, and retention as well as merge semantics.

## Operator-facing explanation

For delete plus photo addition:

> Two laptops changed this observation while disconnected. One marked it deleted; the other added a photo. The photo has not restored the observation and no photo contents were sent. Keep the deletion and leave the photo separate, or explicitly restore the observation with the photo?

For a field conflict, show site and observation IDs, field, shared/base value if known, all competing values (not just two), originating laptop/person label, and why review is required. Say that it needs review. If a value was automatically selected for internal convergence, expose that fact and the alternatives; never imply that selection was user-approved. Avoid database jargon and timestamps as authority.

## Released plan: clause-by-clause disposition

Each quoted sentence below is copied from the released plan. The disposition preserves the feasible direction while resolving unsupported assumptions and unresolved user-data choices.

### Paragraph 1

1. > The draft uses a transactional embedded store for observations and a second append-only journal carrying operation identifiers, author labels, and per-record revision numbers.
   
   **Disposition — retain two logical responsibilities; correct identity/atomicity; engine remains open.** Prefer one transaction for event, projection, and origin sequence. If a separate physical journal is used, define an outbox/recovery protocol; unrelated writes are not atomic. Add persistent replica ID, epoch, per-origin sequence, unique event ID, and causal context. Labels are descriptive; record revision alone does not identify or order operations. SQLite Session changesets cannot replace application history because they are optional, PK/table constrained, schema-sensitive, and coalesce/revert changes.

2. > Photos remain in a directory selected by the operator; journal entries hold relative references and hashes.
   
   **Disposition — retain separation and explicit choice; strengthen manifest; path semantics remain an owner decision.** Keep content out of journal/sync by default. Add attachment ID, observation/incarnation, original external link, hash algorithm/digest, length, MIME, and per-device state when known. Hashes do not ensure availability or portability. Missing files do not erase observations. Stage/verify selected content separately. For CouchDB, embedded stubs do not disable replication of embedded bytes; external URI fields are not shown to be followed by CouchDB itself, but app code must also avoid automatic retrieval.

3. > Each laptop exchanges journal segments through a relay on the office network, with removable-media bundles as a fallback.
   
   **Disposition — retain as feasible, with relay policy open.** Use the same versioned, idempotent event/package format over either carrier. Include bundle ID, schema, sender replica/frontier, operations and causality, checksums, and optional explicitly selected media. The relay is not semantic authority. Removable exchange remains usable without network. CouchDB checkpoints are one candidate capability, not a requirement.

4. > Nothing requires a hosted account.
   
   **Disposition — retain as a hard constraint.** No hosted account may be a prerequisite for recording, review, recovery, or transfer. Optional local relay setup may be proposed; no photo upload is automatic.

### Paragraph 2

5. > For now, the relay accepts operations in arrival order.
   
   **Disposition — reject as semantic order.** Arrival can govern queue forwarding only. Preserve origin sequence and causal frontier, buffer missing predecessors as needed, and do not rewrite events or select values based on reconnect order.

6. > A revision mismatch opens a conflict card showing the old value and both edits.
   
   **Disposition — retain review surface; improve detection/content.** A mismatch is a stale-base signal, not full conflict proof. Use causal base/frontier; show the shared value when known, all competing alternatives, identifiers, origin labels, and reason. A resolution is a new operation referencing alternatives. For CouchDB, conflicts=true supplies losing IDs; fetch bodies using open_revs and handle missing/pruned bodies.

7. > Nonoverlapping field edits are proposed for automatic merging, while delete-versus-edit is routed to review.
   
   **Disposition — retain with causal condition; extend delete review to photo-add.** Merge disjoint fields only when causal history establishes independence and no invariant is broken. Review same-field changes and delete versus edits or photo-add. Preserve the tombstone; a photo stays pending/unlinked until explicit keep-separate or restore.

8. > The draft assumes that laptop-local revision numbers plus an author label uniquely identify operations, and that acknowledgment permits discarding sent segments.
   
   **Disposition — reject both assumptions.** Use replica ID, installation epoch, origin sequence, unique event ID, and causal context; define clone/reinstall behavior. Acknowledge after durable import/cursor commit. Retries deduplicate. Do not discard history until the required active replicas hold a verified snapshot/frontier and retained tail.

9. > Whether either assumption survives reinstall, lost acknowledgments, and interrupted transfer is unresolved.
   
   **Disposition — make an engineering obligation before network integration.** Test epoch rotation, clone/reset, lost ack, crash before/after import commit, and partial package. Cursor cannot advance for uncommitted work; committed work must tolerate resend.

10. > Wall-clock timestamps are display information, not a winner rule.
    
    **Disposition — retain.** Keep timestamps informational and label them device-reported/approximate. Causal metadata and explicit review determine conflict behavior.

### Paragraph 3

11. > Save and journal append should appear atomic to the application.
    
    **Disposition — strengthen into a testable invariant.** A save commits operation, projection, and sequence together or none; restart reflects the last committed state. SQLite WAL+FULL is a local baseline only under the documented sync/VFS/device conditions; WAL is not multi-host storage.

12. > The draft has not yet selected one database transaction or a coordinated file protocol, and attachment copying remains an explicit action.
    
    **Disposition — keep engine open; specify storage boundary.** Use a single transaction for journal/projection/cursor in the chosen local store. Media staging and reference commit are a separate recovery protocol, not a claimed cross-resource transaction. Use SQLite Online Backup API for a consistent live snapshot if SQLite is selected; snapshots do not merge replicas.

13. > It proposes a retention setting for resolved conflicts but leaves recovery after retention open.
    
    **Disposition — do not expose retention control before recovery semantics.** Keep resolved history inspectable; do not auto-prune unresolved alternatives or anything needed by an active week-offline replica. Define snapshot, acknowledged replica frontier, backup verification, and recovery horizon. Season/archive/legal retention and eligible replicas remain owner decisions.

14. > Validation would replay duplicate segments, interrupt saves, reconnect after competing deletion and photo addition, and restore a copied store.
    
    **Disposition — retain and expand as proposed validation.** Restore from a consistent snapshot and verify events, projections, cursors, tombstones, and media manifest. Include partial/reordered delivery, lost acknowledgment, crash boundaries, schema errors, clone/reset, and later edits after resolution. None has been run here.

15. > No checks have been run.
    
    **Disposition — retain as to product validation; clarify research performed.** This reviser independently read the listed primary source pages for selected claims. No application tests, executable witness, crash test, prototype, or benchmark ran. PR checks described in the upstream PR remain upstream-only.

16. > A staged proposal should settle identity and durability before adding convenient merge behavior.
    
    **Disposition — retain and make sequence concrete.** Settle identity, deletion/restore, transaction/recovery boundaries first; then add auto-merge and review UX. Prototypes remain exploratory, not product commitment.

### Paragraph 4

17. > This is a provisional draft for review after the declared reveal, not an endorsed answer.
    
    **Disposition — retain.** This is a researched proposal for owner review, not a product decision or deployment authorization.

18. > Resolve material assumptions through applicable primary evidence; retain open user-data questions when they cannot be answered from sources.
    
    **Disposition — retain.** Sources cannot decide duplicate ecological observation semantics, field immutability, restore identity/authority, paths, retention, or relay availability. The missing application repository also prevents integration findings.

19. > No future product deployment is requested.
    
    **Disposition — retain as scope limit.** No application was modified or deployed.

## Bounded integration sequence

1. Decide product semantics: editable fields and site-ID rules; duplicate-observation identity; actor/device labels; delete/photo behavior; explicit restore and authority; media paths and retention. Write truth-table examples.
2. Prototype the same event envelope and merge cases in SQLite plus application journal, Automerge, and CouchDB only if an office relay is acceptable. Record exact versions, flags/builds, package/deployment burden, merge results, migrations, and recovery limits. Test the actual Rust API if it is chosen.
3. Prove local transaction, snapshot/restore, schema migration, clone/reset, and crash-boundary behavior with the selected engine. Keep the event contract transport-neutral.
4. Deliver manual package exchange first: versioned manifest, checksums, idempotent import/export, partial-transfer recovery, and optional explicitly selected media. Test on removable media.
5. Add a network carrier for the same event/package format. Make durable acknowledgment and per-replica checkpoints visible; retain history while a required laptop is behind. Network absence and a seven-day offline period are normal.
6. Add conflict and recovery UI only after the semantics and persistence invariants are defined. Preserve links from each resolution to its operations and let operators inspect alternatives later.
7. Pilot on copies and representative hardware. Benchmark 50,000 observations with representative notes/indexes and varied, owner-specified media sizes and link rates. The brief provides no media/throughput range, so do not promise capacity or sync time in advance.

## Failure-oriented validation plan — PROPOSED, NOT EXECUTED

| Case | Exercise | Required result |
|---|---|---|
| Local power loss | Interrupt before save, during commit, and after reported commit for note/confidence/site ID; restart | Event, projection, sequence are all before or all after; status is honest |
| Receive commit before lost acknowledgment | Crash after durable import and before ack; resend same package | One logical operation; cursor/projection agree; duplicate safely acknowledged |
| Partial import | Truncate package and stop at each batch boundary | No cursor advancement for uncommitted work; resume or reject safely |
| Offline concurrency | Two devices edit same base in both exchange orders: disjoint fields and same field | Only independent fields merge automatically; all alternatives remain reviewable |
| Delete conflicts | Delete versus note/confidence/site change and versus photo-add; include a third laptop back after seven days | Tombstone is not removed silently; edits/photos need review; restore explicit |
| Identity reset | Reinstall, restore backup to second device, clone database, then exchange | No silent event ID/sequence collision; reset is visible and recoverable |
| Media integrity | Missing path, changed bytes under same name, corrupt/incomplete opt-in transfer | Observation survives; state is accurate; mismatch cannot be marked available |
| Bad/old bundle | Bad checksum, unsupported schema, duplicate ID with changed body, reordered/unknown causal event | Reject/quarantine clearly; no partial cursor advance or overwrite |
| Storage/permissions | Full disk, read-only store/directory, missing WAL sidecar after unsafe copy, failed flush | Do not claim save success; preserve committed state; recovery is described |
| Snapshot and retention | Restore consistent snapshot; resolve conflict then inspect; reconnect after week; test compaction frontier | History/tombstones needed by lagging replicas remain recoverable |
| Scale/network | 50,000 observations, realistic note/index data, parameterized attachment sizes/link speeds | Measure load/save/import/export/storage; set limits only after ranges are agreed |

## Owner decisions and uncertainty

- Is site ID editable, and how are duplicate ecological observations recognized without using site ID as primary record key?
- Which fields merge independently; what makes competing notes/confidence values materially conflict?
- Can the operator keep a photo separately, restore with a new incarnation, or both; who may decide?
- Are links laptop-local, shared-office paths, or external URIs? Should selected media ever enter managed storage?
- Which replicas must acknowledge before compaction? Is the relay a durable replica? What are season, archive, and legal retention needs?
- Is an office LAN relay acceptable, or must removable exchange be the only guaranteed path?
- Which app repository, language, OS/filesystem, database, packaging, callers, schema, and existing tests govern integration? These were not supplied in this input map.
- What actual attachment sizes and connection speeds should the 50,000-observation target cover?

Until those are answered, the engine and sync product remain open. The required invariants are stable identity, idempotent replay, recoverable event history, explicit conflict resolution, crash recovery, manual transfer, and no automatic photo transfer.

## Source map / index

IDs S01–S21 retain the investigator’s exact URLs; S22–S23 are critic additions. Full release/commit identity, locator, observed operation, governing condition/default/exception, applicability, and prior access windows are in the accompanying source-map.json. Its reviser review records the current independent checks for SCW evidence. Source IDs are not rebound.

### SQLite
- [S01 Session extension introduction](https://www.sqlite.org/sessionintro.html) — optional build flags, primary-key/table limitations.
- [S02 Session API](https://www.sqlite.org/session.html) — changeset application, coalescing, consumer conflict handling.
- [S03 WAL](https://www.sqlite.org/wal.html) — same-host limit, commit sync, sidecar, checkpoint behavior.
- [S04 synchronous pragma](https://www.sqlite.org/pragma.html) — FULL/NORMAL power-loss behavior.
- [S05 Online Backup API](https://www.sqlite.org/backup.html) — consistent live snapshot, not merge.
- [S06 release history](https://www.sqlite.org/changes.html) — inspected 3.54.0 release context dated 2026-10-09.
- [S23 atomic commit](https://www.sqlite.org/atomiccommit.html) — flush/fsync and hardware assumptions.

### Automerge
- [S07 conflict documentation](https://automerge.org/docs/reference/documents/conflicts/) — deterministic ordinary read and exposed conflicts.
- [S08 JS source, tag js/automerge-3.4.1](https://github.com/automerge/automerge/blob/js/automerge-3.4.1/javascript/src/implementation.ts) — tagged implementation; not Rust parity.
- [S09 package metadata, v3.4.1](https://github.com/automerge/automerge/blob/js/automerge-3.4.1/javascript/package.json) — release identity/test command; not run.
- [S10 v3.4.1 README](https://github.com/automerge/automerge/blob/js/automerge-3.4.1/README.md) — implementation overview.
- [S11 Autosurgeon](https://github.com/automerge/autosurgeon) — Rust mapping candidate, version unpinned.
- [S12 issue 526](https://github.com/automerge/automerge/issues/526) — nested-object lineage report; release applicability unverified.
- [S13 issue 889](https://github.com/automerge/automerge/issues/889) — report cites 2.1.11; status corrected by critic, v3.4.1 applicability unverified.

### CouchDB
- [S14 conflict handling](https://docs.couchdb.org/en/stable/replication/conflicts.html) — basic GET, conflicts=true IDs, open_revs bodies, pruning.
- [S15 replication introduction](https://docs.couchdb.org/en/stable/replication/intro.html) — push/pull, checkpoints, deletions, filters.
- [S16 attachment API](https://docs.couchdb.org/en/stable/api/document/common.html) — summary/stub vs attachment data.
- [S17 document best practices](https://docs.couchdb.org/en/stable/best-practices/documents.html) — revision history versus app history.
- [S18 PR 6129](https://github.com/apache/couchdb/pull/6129) and [S19 changed files/tests](https://github.com/apache/couchdb/pull/6129/files) — attachment recreation fix and upstream tests/checks, not executed here.
- [S20 CouchDB 3.5 release notes](https://docs.couchdb.org/en/stable/whatsnew/3.5.html) — PR 6129 under 3.5.3.
- [S21 PR 6025](https://github.com/apache/couchdb/pull/6025) — datasync reset/truncate fix lineage; package inclusion unverified.
- [S22 replication protocol](https://docs.couchdb.org/en/stable/replication/protocol.html) — replicated document attachments; external URI fetch is not established.
