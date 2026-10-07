# Critique — Field inspection sync proposal

**Stage:** ER10 I-ANCHOR-LUNA treatment / critic-finalizer-v1  
**Role:** Same-family independent critic and finalizer  
**Scope:** The exact INPUTS.md map, its brief and frozen plan, the required research-v1 draft, that draft’s source register/evidence, and direct checks of the cited public primary sources. No other arm, review, answer key, evaluator, parent analysis, or cost material was used.

## Overall disposition

The draft is a strong, properly bounded proposal and covers the governing research obligations. I support its central product choice for a bounded prototype: retain local SQLite, make a field visit a distinct inspection submission, preserve same-field concurrent alternatives, and make a named review action resolve them. I also support the recommended relational/outbox path as the leading prototype candidate because the brief requires a useful history and a supervisor-facing review view. This remains a proposal, not an implementation or production-component lock.

The final retains the CouchDB/PouchDB replication alternative, Automerge CRDT alternative, ODK field-data analogue, SQLite/PostgreSQL affordability discussion, optional choices, and uncertainty list. It also preserves the draft’s claim limits and all proposed validation areas. Changes below make the sync feed, pending-parent behavior, authorization scope, and deletion horizon more operationally explicit; they do not claim those choices are already implemented or proven.

## Coverage and dispositions against the brief

| Obligation | Draft coverage | Critic disposition |
|---|---|---|
| Genuine primary public sources | Official SQLite/PostgreSQL/CouchDB/Automerge/ODK/OWASP/IETF/RFC material and upstream GitHub issue, commit, release, and adapter sources, with local notes and hashes. | Supported. Independently reopened consequential sources. Rolling documentation and unpinned versions remain labeled as such. |
| At least two substantially different mechanisms and important alternatives | LWW row, CouchDB/PouchDB revision-tree replication, Automerge CRDT, and relational outbox/API/event log. | Supported. The final explains that revision-tree replication, CRDT merging, and application event handling move conflict work to different places and do not provide interchangeable guarantees. |
| Analogous systems beyond direct competitors | ODK Collect/Central submission states, review history, and missing-media warning. | Supported as a workflow analogue only. It is not presented as a multiwriter sync engine or proof of the proposed service’s behavior. |
| Actual behavior at a pinned component/code version | PouchDB commit 34cb691… and React Native SQLite adapter README commit e269c430…; Automerge JavaScript API at v3.5.0. | Supported with conditions. The PouchDB fix/test is pinned; the adapter README is a separate community component. SQLite and PostgreSQL behavior comes from versioned or living docs, not a selected mobile binding or deployed binary. |
| Pertinent issue, fix, regression test, and release applicability | PouchDB #8525 → commit/test → PouchDB 9.0.0 release notes. | Verified and retained. The issue is a single reporter’s workload; the added test skips remote targets and does not cover the mobile SQLite adapter, photos, or this proposal. The 9.0.0 page is currently marked Latest, but that does not settle dependency health or adapter compatibility. |
| Conflicts, duplicate/reordered delivery, retention/deletion, access, attachments, observable tests | Detailed model and eleven proposed checks. | Supported, with additions: define durable cursor/feed behavior for accepted, pending, and later-resolved events; reject stale supervisor resolutions; test cursor expiry/rebuild; treat offline revocation and tombstone expiry as policy boundaries. |
| Compare discoveries with frozen plan | Seven-row correction table. | Supported and carried into the final as a direct baseline-to-proposal table. |
| Preserve choices, optional opportunities, uncertainties, and proposals | GIS/CMMS authority, coordinates, identity, audit level, retention, devices, media sizes, scale, hosting, and post-submit correction remain open; ODK and attachment alternatives remain optional. | Supported. The final keeps these as decisions for the utility rather than silently choosing on its behalf. |
| Separate proposed from executed checks | Draft explicitly says no tests were executed. | Supported. The final states that research-source inspection is not product testing; all acceptance checks remain proposals. |

## Detailed findings

### 1. Product model and conflict behavior — retain, make the distinction explicit

Separating the asset catalog from inspection evidence is the most important domain correction. A crew visit should normally create a distinct inspection rather than overwrite a single asset-wide row. This avoids treating two observations as edits to one object when the real product may need both observations. The final retains the open decision about which fields are observations and which fields describe a shared current state; only the latter require same-field conflict resolution.

The draft correctly keeps capture time, device sequence, server receipt time, and causal parent/head relationships distinct. A device clock cannot establish cross-device order. The final preserves the rule that independent additions may coexist only where the domain confirms independence, and that conflicting shared-state values stay visible until a supervisor records a resolution naming the alternatives.

One gap is stale resolution: a supervisor may resolve a conflict set that changed after the review screen loaded. The final requires a resolution to name the exact head/event set it reviewed. The server must reject or return the newer conflict state if that expected set no longer matches. This is a proposed contract and test, not a capability supplied by PostgreSQL or an event log.

“Append-first” is appropriate only within the approved retention policy. It must not be read as a promise never to erase information. The final ties correction history and tombstones to utility-approved retention and purge rules.

### 2. Outbox, retries, reordering, and pull cursor — retain with a feed contract

The SQLite transaction that stores a local edit and its outbox envelope is a useful durability boundary. SQLite documents multiple concurrent readers, one writer, and possible SQLITE_BUSY when a read transaction cannot be upgraded; the draft properly proposes bounded retry and visible failure state. That documentation does not prove the target phone’s filesystem durability, encryption, or the behavior of a specific SQLite binding.

The stable event ID, same-content retry, unique tenant/event key, and payload-hash mismatch rejection are good proposed semantics. PostgreSQL ON CONFLICT provides an atomic insert-or-update primitive under concurrency, and HTTP PUT is idempotent by method semantics when the resource is designed accordingly. Neither primitive compares application payload hashes, produces exactly-once delivery, or makes the projection safe by itself. The final says the service must atomically persist identity/receipt and projection effects, and explicitly deduplicate derived effects.

The draft permits an event with a missing parent to be stored as pending, but its pull contract pages only accepted server events. That leaves a gap: clients need to learn that an event is pending and later learn when it becomes projectable, while advancing a cursor without skipping state changes. The final resolves this proposal-level gap by requiring a durable per-tenant feed of event and status-change records with a monotonic server position behind an opaque cursor. A child may be received and remain pending; its later accepted/rejected/review transition must be represented in that feed. The client applies each page and commits its next cursor in the same local transaction. Cursor expiration requires a defined full-resnapshot/reconciliation flow, including tombstones and unresolved work. These are design choices to validate, not existing PostgreSQL features.

“Server sequence/cursor” needs to mean committed feed order, not a device sequence and not merely an ID that clients assume is gap-free. The final states that explicitly. Response-loss, duplicate, altered-payload, parent-order, crash-before/after-commit, cursor replay, and cursor-expiry cases remain proposed tests.

Because the server feed can contain other crews’ work, its entries must be filtered through the same object-level authorization rules as direct reads. The final binds cursors to the authorized scope and leaves invalidation/resnapshot policy explicit when assignments change.

### 3. Attachments — retain states and integrity checks, avoid hidden guarantees

The draft correctly rejects “photo path” as a complete attachment model and treats metadata event receipt separately from the arrival and integrity verification of bytes. Stable attachment IDs, size/type metadata, content digest, protected local storage, pending/available/incomplete/removed UI states, and independent attachment authorization are carried forward.

A digest can verify that bytes match a recorded digest; it does not by itself prove who captured them or that a compromised device did not replace both bytes and digest. The final says this directly. It also preserves the conditional design: whole-file PUT retry first; consider idempotent resumable chunks only if field measurements show whole-file retry is too costly. CouchDB’s cited Range Requests section is specifically about resumable downloads, not uploads.

PostgreSQL bytea is a possible small-pilot storage choice, not a measured performance recommendation. The final keeps photo-size, bandwidth, backup, and restore measurements as selection gates and allows utility-operated object/file storage if results warrant it. Ready and purge state must remain independently verifiable.

The React Native PouchDB adapter README at the pinned commit documents an attachment-specific Metro workaround because the default browser bundle can hang on binary putAttachment. This is valuable if that stack is shortlisted, but the brief does not state React Native is the client. The final labels this a conditional compatibility spike, not a reproduced defect, general PouchDB guarantee, or reason to adopt that adapter.

### 4. Delete, retention, and offline device behavior — retain, define the horizon

Logical deletion as a tombstone, separate content purge, reconciliation of old clients, and no promise of remote erasure from a disconnected device are all supported. CouchDB documentation makes the tombstone/purge distinction concrete and says external purge operations do not propagate to external databases. This is evidence about CouchDB only; the final does not transfer its exact behavior to the proposed service.

The draft says an old client must reconcile against tombstones but does not set the condition under which it may continue to push after tombstone history is removed. The final makes that a utility policy and gate: define the maximum acceptable offline/recovery age and retain tombstones for at least the period required by that policy; an older or restored client must rebase against a current snapshot or be held for review before it can upload. The utility must separately set expiry for event bodies, metadata, photos, exports, and backups and define evidence of purge. No deadline can be chosen from the current inputs.

### 5. Access control and offline identity — retain, strengthen object-level policy

The draft correctly distinguishes a claimed field operator from the authenticated principal who submits later, and says that a device ID does not prove a human authored an offline edit. It also correctly places the API between field clients and databases and proposes external-browser OAuth with PKCE for public native clients if OAuth is selected.

The final sharpens the authorization model: combine roles with tenant, crew/region, asset, and action relationships/attributes, deny by default, check each request server-side, and cover photos, static/file resources, sync cursors, conflict resolution, exports, and deletion—not just inspection rows. OWASP’s current authorization guidance expressly covers least privilege, deny-by-default, per-request checks, object identifiers, static resources, and use of attribute/relationship-based rules where roles alone are too coarse.

Offline access cannot be revoked on a device that remains disconnected. The final preserves this as an unresolved policy decision and adds an explicit lost-device/re-enrollment and cached-assignment expiry gate. It adds platform-protected local-key/storage review as a validation question; no input supports a claim that encryption is already provided. If non-repudiation is required, key management and a signed chain-of-custody design are a separate decision. A server receipt proves receipt under a server identity, not that a device’s offline history was unaltered.

### 6. Supervisor history, review, and exports — retain the useful workflow

The proposed view’s asset/inspection timeline, author/device claim, capture and receipt times, attachment state, current review status, unresolved alternatives, and resolution event are appropriate. The final retains filters and export provenance, and adds parity checks among accepted events, materialized projection, conflict queue, browser view, and CSV. It does not flatten concurrent values into a fictitious “latest” row.

ODK Central provides an analogous submission review state, missing-media warning, and activity history; ODK Collect’s finalized/sent states illustrate queuing an offline visit. These are useful workflow ideas, not proof that ODK solves multi-crew collaboration or this proposed sync model. The final keeps adopting those labels conditional on supervisor workflow decisions.

### 7. Mechanism comparison and recommendation — supported, but no production lock

The frozen last-write-wins row is appropriately rejected as the authoritative model because it has no safe rule for concurrent observations, out-of-order posts, retries, attachments, or deletes. It may remain a small projection only where the utility defines a deterministic, reviewable field policy; the final does not forbid a display-only suggestion.

CouchDB/PouchDB offers a distinct revision-tree replication approach with checkpoints, retries, tombstones, attachments, and conflict leaves. Its deterministic read/view winner can conceal conflicts unless the application explicitly fetches and presents them. Database members can read all documents, so that database membership is not crew-scoped authorization. Purge is separate from replication. This is a serious alternative, not a straw man, and is retained with native attachment/auth/deployment spikes as gates.

Automerge differs materially: CRDT operations merge while concurrent property writes remain inspectable through getConflicts; its JavaScript API page identifies version 3.5.0. That API does not supply domain conflict policy, relational review, attachment lifecycle, auth, or server durability. The Rust sync module reference states a reliable in-order stream assumption and has no visible crate version, so the final preserves the transport qualification but does not treat it as pinned evidence for an exact deployment.

The relational outbox/API path is the best leading prototype candidate if audit queries, attributable receipt history, and utility control matter more than packaged replication. It entails more application-owned sync and operations work. The utility’s existing GIS/CMMS, platform, identity, staffing, device, hosting, and service ownership could change that choice. No source proves that this proposal is cheaper or more reliable in that environment.

### 8. Issue/fix/test/release trace and limits — verified

The upstream PouchDB issue #8525 is a user report about compaction latency and observed 409 writes in one workload, not a measured general rate. The pinned commit restores the since/last_seq filter in compaction and adds a regression test that simulates an earlier compaction checkpoint and confirms an older revision remains readable. The test explicitly skips remote targets. The 9.0.0 release notes list the fix for #8525, and the release page is marked Latest when reopened for this finalizer.

This is adequate relevant implementation history for the packaged replication alternative, not evidence that the proposed application protocol works. It says nothing about React Native SQLite compatibility, attachments, authorization, offline days, or this event model. The final states these limits and keeps current dependency/maintenance review and the adapter spike as gates if PouchDB is reconsidered.

### 9. Corrections, optional opportunities, open choices, and validation — carry forward

The draft’s correction table maps the thin plan’s mutable row, wall-clock latest-wins, changed-record POST, undefined retries, path-only photos, latest-only review/export, and undesigned auth/delete/conflict/audit to explicit work. All rows are retained in the final.

The optional inspection-submission lifecycle, separate asset and observation coordinates, conditional CouchDB alternative, and license/operating-cost distinction are retained as opportunities. The final additionally calls out offline local storage protection and cursor/tombstone retention horizons as gates, not selected product rules.

All open product questions remain open: source of the asset catalog/GIS or CMMS; field-specific semantics and review; identity provider and offline credential lifetime; traceable attribution versus signatures; retention schedules; device platform and whether React Native is even in scope; image size/volume/bandwidth; crews, records, offline days and quotas; utility IT’s ability to operate the service; and whether a sent inspection can be corrected.

The eleven draft validations are retained and expanded with stale-resolution rejection, cursor invalidation/resnapshot, pending-event status transitions, and an offline or restored client older than the tombstone horizon. **None was executed.** Public documentation and source history were inspected; no app code, build, installation, or product test was run.
