# Final proposal: Disconnected field-survey edit journal

**Status:** Complete research proposal for review. This is not an implementation, a deployment instruction, or a technology selection.

**Scope:** The assigned brief and the one-time released draft plan for run A-F01-A1. The plan-reveal record binds the plan to SHA-256 9415bac7a1feba432895879eaa283f75facac34896039a869facf5b620c1f8d4 (2,368 bytes) and discovery to SHA-256 54d89f407a04054cccfddefb0cf279b9d963e03b4ae69bed44f9e3d0cf1dab1a. The release record says the plan was revealed once at 2026-10-12T00:35:54.377Z. Stable source IDs are retained in source-map.json and indexed in sources/index.md.

## Scope and fixed requirements

Design for an existing desktop ecology-survey application used by three field laptops. A laptop may be disconnected for a week. An observation has a site identifier, notes, a confidence flag, and links to photos stored separately. Up to 50,000 observations may be collected in a season; photo sizes and connection speeds are unknown. The application language and storage engine are undecided.

Two offline users may edit the same observation. A deletion may overlap with another edit or photo-link addition. Reconnection must offer a clear recovery path, including after power loss during save or reconnect. Preserve competing edits in recoverable history without asking operators to understand database internals.

The design must not require a hosted account, automatically upload photo bytes, use wall-clock time as the sole conflict rule, or let reconnection silently restore a deleted observation. Manual removable-media transfer remains possible when the network is unavailable. The requested output is a research-backed proposal with feasible alternatives, a bounded integration sequence, and failure-oriented validation proposals. The 50,000 figure is a sizing input, not proof of performance.

## Recommendation

Use a storage-neutral append-only operation journal as the authoritative edit history and derive the visible observation view from it. Keep the journal and materialized view in one local transaction when the existing store supports that boundary. Use one versioned exchange format for an optional office-LAN store-and-forward relay and manual removable-media bundles. The relay is a convenience, not a leader; delivery order is not merge truth. Photo references travel by default; photo bytes stay in their selected separate directory unless an operator explicitly selects files for a manual package.

This is an architecture direction, not a selection of SQLite, CouchDB/PouchDB, Automerge, RxDB, or a programming language. First inspect the application’s actual storage API, transaction boundary, backup/restore behavior, and photo locators. No application repository, language, shipped database build, or caller/test path was supplied, so compatibility is unresolved.

Preserve every branch until its resolution is recorded as a new operation. Model deletion as an explicit tombstone and require a separate, explicit restore operation. Never let an incoming ordinary edit or a photo reference make a tombstoned observation active. Wall-clock timestamps may help people compare edits; causal ancestry and declared field policy govern their relationship.

## Operation, identity, and causal history

Each immutable operation should carry:

- an observation ID distinct from its operation ID;
- a stable, globally unlikely-to-collide operation ID, reused unchanged on every retry;
- the originating replica-instance ID and a local sequence for traceability and gap diagnostics;
- an optional local author label, treated as display text rather than identity or uniqueness proof;
- causal parent operation IDs or the observed frontier for the observation;
- a typed action: set a named field, add/remove a photo reference, delete/tombstone, explicit restore, or conflict resolution;
- the base operation/value where a three-way review needs it;
- a schema version and approximate display timestamp.

Choose an operation-ID encoding only after application inventory. A random opaque ID plus a local sequence and replica ID is one candidate; a counter and author label alone is not. Identity allocation and operation persistence belong in the same durable transaction. Replays of the same ID and identical payload are no-ops. The same ID with different payload bytes is a corruption/collision: quarantine the batch and preserve its bytes for review rather than overwriting either value.

Define replica identity as a lifecycle, not a field copied blindly with the store:

1. A fresh independent installation receives a new replica-instance ID.
2. Restoring a backup as the continuation of the same laptop preserves its ID only when the prior instance is replaced or retired.
3. A copied store intended for a second active laptop must pass through an explicit “new independent replica” step that assigns a new instance ID before editing or synchronization is enabled. Future operations use the new identity; historical operations are not rewritten.
4. If packages later reveal the same replica ID with divergent frontiers or sequence histories, quarantine that identity split and keep both operation sets. An operator must identify which store continued the prior replica and which became independent before synchronization resumes. If either side made edits before re-identification, retain those operations and expose the uncertain attribution; do not delete or silently reassign them.

No account or central identity provider is needed. This workflow reduces accidental clones but is not proof of a real person’s identity. A locally assigned person/laptop label is only contextual.

Causal parents answer whether an operation was based on another operation. Transport sequence numbers and checkpoints answer which data a receiver has seen; they do not establish which edit is newer. A relay or import may receive a child before its parent. Keep such operations pending and out of the visible materialized result until the missing ancestry arrives and validates. Recompute deterministically when it does.

## Local save and restart recovery

For each local edit, commit the operation, updated observation view, causal frontier, identity sequence, and local transfer state within one transaction if the selected store permits it. Show “saved” only after that commit succeeds. Reopen the store after an interrupted save: a committed operation appears exactly once, an uncommitted operation does not appear as a partial edit, and a stale materialized view can be rebuilt from the journal.

If the current application cannot keep the operation and view in one database transaction, specify and review an intent/segment recovery protocol before implementation. Do not assume two files append atomically. If SQLite is selected, verify the actual bundled version, build flags, schema, journal mode, and target platform. SQLite’s Session Extension is a possible changeset transport, not a readable edit log: it needs compatible tables and declared primary keys, can be build-disabled, and coalesces repeated changes made within a session. SQLite crash-test evidence describes simulated partial writes and reopen checks; its own documentation also names filesystem, lock, flush, hardware, and hot-journal assumptions. Neither source validates the eventual survey build.

After restart, show the last complete durable state in ordinary terms, for example: “Last saved on Laptop A; 3 edits are waiting to transfer.” If the platform cannot establish that a requested flush completed, explain that limit instead of promising hard power-loss durability.

## Photos and the database/file boundary

Keep photo bytes outside routine synchronization and outside the edit journal. A cross-device photo/object ID identifies the logical file. Shared metadata may carry a content digest, byte length, and media type; the exact digest and ID formats remain owner choices. Keep a laptop-local relative locator separately because it may not exist or resolve on another laptop. Never interpret an imported locator as a destination path.

A photo-reference operation never copies or uploads bytes. A manual bundle may include only files the operator selects. Its manifest reports each referenced photo as included and verified, excluded, absent, inaccessible, or failed integrity verification. A missing file does not erase the reference operation. An edit-log conflict or compaction never deletes an external photo.

A database transaction cannot also commit a separately stored file. Before applying a package that explicitly includes photo bytes, preflight the complete package, then stage selected files under controlled temporary names within the chosen destination volume, enforce configured size limits while streaming, and verify their declared length and digest. Use a platform-appropriate durable placement procedure and test it on the selected filesystem. Only after the selected bytes are verified and placed should one database transaction record the operations, references, materialized view, import receipt, and completed import state. A crash before that commit can leave an unreferenced staged or placed file; restart must recognize and safely resume or clean it without deleting a source file. A crash after a successful commit must show the committed reference and file status. Do not claim atomicity across the database and file store. If file placement cannot be verified, do not commit a reference that claims the included file is present; report a missing or unverified file explicitly.

For a reference-only package, import the reference operation without photo bytes and record that the file is not in the transfer. A user may later import the selected file as a separate, verifiable action.

## Exchange, import boundary, acknowledgments, and retention

Use one versioned immutable segment format for both the optional LAN relay and manual transfer. Each segment should identify its package, source replica and epoch, schema version, causal dependencies/frontier, operation IDs and payloads, sequence range, lengths, and an integrity manifest. Receivers validate the complete manifest and operation set before changing database state. An unsupported schema is rejected or transformed only through a named, versioned migration; it is never silently reinterpreted.

Define finite import limits before release: maximum envelope size, manifest and operation counts, metadata lengths, per-file and aggregate photo bytes, and parser work. Set numeric values from the field data and hardware/storage targets, but require concrete caps for every build. Reject malformed, over-limit, truncated, or unsupported packages as a whole before database changes. Stream-check declared lengths and digests. Treat an imported relative locator as inert metadata, never as a filesystem path. A package integrity checksum detects accidental changes; it does not establish who sent the package or authorize its contents.

A repeated operation ID with the same canonical payload is a safe retry. A repeated ID with different bytes, inconsistent manifest lengths/digests, missing required entries, or invalid schema is quarantined and leaves the database unchanged. Valid operations whose causal parents have not arrived can be committed as pending import state, but they must not affect the visible observation until their ancestry is available. Record pending imports and progress durably so restart is safe.

A receiver acknowledges a package only after the operations and its stated photo-import result have durably committed. If the operator chose reference-only, the receipt says that photo bytes were excluded. A relay acknowledgment means only that the relay durably accepted the package; it does not mean the other two laptops imported it. If an acknowledgment is lost, the sender retransmits and operation IDs make retries idempotent. Retain enough receipt/deduplication history to recognize a retry safely.

Retention must satisfy the one-week disconnected requirement and remain explicit. Protect unresolved competing branches from pruning until a user records a resolution. Keep operations long enough for at least the full seven-day offline interval plus an owner-defined reconnection/discovery/transfer grace window. Do not remove an operation that an active replica has not durably acknowledged unless a verified archive preserves it. Proposed default: retain active-season operations and resolved branches in a restorable archive through season close; prune only after a restore check and an owner-approved retention period. If a laptop is lost or retired, an owner-authorized retirement and archive step must settle its replica status. Longer-term resolved-history duration and a permanently offline device policy remain owner decisions.

## Merge and operator recovery

Use causal ancestry and field overlap:

- Operations that changed independent fields from a common base may be automatically combined only when the declared field rules make them commute. This is a proposal gate, not a blanket guarantee that every different-field edit is safe.
- Concurrent writes to the same field remain competing values. Show the last common value, each value, its device/person label, and approximate time. Do not choose by wall-clock or delivery order.
- Treat notes as same-field conflicts by default. The group may choose append-only note entries or fund a specific, tested text merge; generic text diff must not discard a researcher’s wording.
- For delete versus edit, keep the tombstone and incoming edit branch. Say which laptop deleted and which edited. “Keep deleted” leaves the tombstone active; “restore” creates a new operation linked to the tombstone and selected edit; “decide later” keeps the review pending. No ordinary edit or relay event restores the record.
- For delete versus photo addition, show the photo link and file-presence status in the same review. The choices are keep the delete, explicitly restore and keep the link, or defer. No photo bytes are moved automatically.
- A resolution is a new operation that references the resolved branches. Preserve source operations after the review card closes for the protected recovery/archive period.

A compact operator explanation should say: “These edits changed different fields, so both are kept”; “Both laptops changed the notes, so choose one or keep them as separate notes if that policy is enabled”; and “One laptop deleted this record while another changed it or linked a photo, so the deletion is waiting for your decision.” Show last durable save, edits waiting, import/transfer state, review items, and missing-file status without database jargon. Whether a second person must approve restoration is for the group to decide.

## Feasible alternatives and limits

| Approach | Fit supported by the evidence | Limits for this brief |
|---|---|---|
| Product-neutral operation journal in the existing embedded store | Best fit to the stated preservation and manual-transfer needs. It expresses causal edits, explicit tombstones, idempotent packages, and a local review history without an account or service. | Requires application-owned schema/versioning, causal merge, import handling, retention/archive, and a review UI. Select only after inspecting the real application. |
| SQLite transactions with Session Extension | Changesets can exchange table edits between compatible schemas and starting data; SQLite is a candidate local transaction engine. | Session Extension needs declared primary keys and build flags; repeated writes within one session coalesce. Patchsets omit original values and cannot detect some data conflicts. It is not the complete per-edit journal or manual-transfer UX. |
| CouchDB/PouchDB revision-tree replication | Supports offline branches, local peer sync and retry; conflicts can be explicitly enumerated. Tombstones replicate. It could be viable if the app runtime and deployment support it. | Normal reads expose a deterministic winner and hide competing leaves until the caller asks for them. Compaction discards non-leaf bodies and pruning bounds history. Application conflict policy remains necessary. PouchDB’s attachment issue #8456 led to a revision-specific fix and regression test in PR #8460; this is a bounded IndexedDB example, not evidence that another adapter or this proposal passes. Its sync route does not define the required removable-media workflow. |
| Automerge CRDT | Supports independent offline changes; different properties combine, and the conflict API exposes concurrent same-property values with actor/counter operation IDs. | Default reads choose one value; assigning again removes the conflict from the conflict API. A concurrent map-key set beats deletion of that key, so record deletion needs an explicit tombstone. Pin and verify an appropriate desktop binding and archive policy first. |
| RxDB custom replication | Allows offline local work with a custom push/pull backend and checkpoints; an account is not inherent in that protocol. | The documented default conflict handler drops fork state in favor of master. A loss-preserving handler, backend and manual-file format must be supplied by the application. |

No source selects a universal winner. Compare the app’s language/runtime, current local database, transaction API, backup model, packaging, and field support needs after inventory.

## Independent critique disposition

| Criticism | Disposition | Final treatment |
|---|---|---|
| F-01: Arrival order cannot define merge truth. | Accept. | The plan’s arrival-order rule is rejected. Causal parents/frontiers define observed history; delivery counters are diagnostics only; missing-parent work stays pending. CouchDB and PouchDB primary docs confirm offline concurrent branches and the need to expose them explicitly. No permutation test was run. |
| F-02: Local revision plus author label is not identity, and cloned-store handling is unenforced. | Accept and amend. | Use stable operation IDs, separate replica identity, local sequence, and causal parents. Require an explicit replacement-versus-independent-clone workflow before the next edit/sync. Quarantine a shared replica ID with divergent frontiers while preserving both payload sets. Recovery semantics for pre-rekey edits are now explicit. Exact ID encoding remains an implementation choice; there is no authenticated person identity. |
| F-03: Acknowledgment is not proof that a segment can be deleted; the one-week requirement needs a retention floor and unresolved branches need protection. | Accept and amend. | Receiver and relay acknowledgments are scoped to their durable hop. Retain at least a seven-day disconnected window plus an owner-defined reconnection grace; protect unresolved branches from pruning, preserve unacknowledged operations or a verified archive, and verify the season-close archive before policy-based pruning. Exact longer-term retention remains an owner decision. |
| F-04: DB atomicity does not cover optional external photo files. | Accept and amend. | Separate database and file guarantees. Preflight, stage, size-check, hash-check and durably place selected files before committing their references; persist import state and recover/clean orphans after restart. Test interruptions at each boundary on the chosen platform. No cross-store atomicity is claimed. |
| F-05: Package validation lacks explicit limits and collision behavior. | Accept and amend. | Define preflight schema, version, manifest, length, digest, operation-ID, ancestry, path-locator, and finite resource-cap rules before release. Require concrete numeric limits per build; choose values from measured field sizes. A checksum is not sender authentication. Invalid packages have no partial DB effect. These are proposed design controls, not executed security checks. |
| F-06: Recovery choices are clearer but must preserve distinct delete, restore, defer, and photo outcomes. | Accept. | The review model keeps the tombstone and competing branch, makes restore a new operation, retains a defer option, and shows photo presence separately. No conflict-card action silently drops source branches. A second-person approval policy remains open. |
| F-07: Alternative-product claims should match the checked primary evidence. | Accept after rechecking the consequential claims. | Directly revisited official CouchDB, PouchDB, SQLite, Automerge, and RxDB documentation plus first-party PouchDB issue, fix, code, regression-test source, and release record. The evidence supports the bounded comparisons above. Documentation is not app compatibility evidence, and the PouchDB test was inspected but not run. |
| F-08: App integration and policy are external inputs. | Accept as unresolved. | No app repository, caller/test paths, language, database build, or photo API was supplied. Do not invent them. Begin with inventory and keep technology, note, identity-label, digest, restore, network, and service-level decisions open. |
| F-09: Validation must be marked proposed rather than run. | Accept. | No application code or functional, performance, import, UI, or crash-recovery test was run here. The matrix below is proposed work only. |

## Exact released-plan clause dispositions

| Exact clause from the released plan | Disposition |
|---|---|
| “The draft uses a transactional embedded store for observations and a second append-only journal carrying operation identifiers, author labels, and per-record revision numbers.” | Retain the two logical roles: an append-only journal and a convenient materialized view. Prefer one transaction and one embedded store when possible. Correct identity to stable operation IDs, replica-instance identity and causal parents. Keep a local sequence for gap diagnostics, not as universal revision order. Storage, encoding and label workflow await app inventory. |
| “Photos remain in a directory selected by the operator; journal entries hold relative references and hashes.” | Retain separate, operator-selected photo storage. Refine shared references to stable cross-device photo IDs and verified digest/length/type; keep relative locators local and inert. Reference-only remains the default. Optional file inclusion is an explicit per-transfer choice. |
| “Each laptop exchanges journal segments through a relay on the office network, with removable-media bundles as a fallback. Nothing requires a hosted account.” | Retain the common versioned exchange format and no-account design. Make the relay optional. Manual removable-media import/export remains a fixed requirement. |
| “For now, the relay accepts operations in arrival order.” | Reject arrival order as merge truth. Merge by operation IDs, causal parents, and declared field rules; keep missing-parent events pending. |
| “A revision mismatch opens a conflict card showing the old value and both edits.” | Retain and complete the card: show the last common base, both edits, affected fields, available labels, approximate times, why review is needed, and an option to defer. |
| “Nonoverlapping field edits are proposed for automatic merging, while delete-versus-edit is routed to review.” | Retain only where known field rules prove operations commute. Route same-field, delete/edit, and delete/photo to review. Record every resolution as a new operation. |
| “The draft assumes that laptop-local revision numbers plus an author label uniquely identify operations, and that acknowledgment permits discarding sent segments. Whether either assumption survives reinstall, lost acknowledgments, and interrupted transfer is unresolved.” | Reject both assumptions. Separate operation IDs from device labels and local sequence. Retry idempotently; acknowledge only durable receipt at the stated hop; protect unresolved branches, unacknowledged operations, and required archive history. |
| “Wall-clock timestamps are display information, not a winner rule.” | Retain. Causal ancestry and field policy govern; timestamps are approximate context only. |
| “Save and journal append should appear atomic to the application. The draft has not yet selected one database transaction or a coordinated file protocol, and attachment copying remains an explicit action.” | Retain the atomic local-save goal; prefer a single DB transaction. If multiple stores are unavoidable, design and review restart recovery before implementation. Distinguish DB transaction guarantees from file placement. Photo copying remains explicit. |
| “It proposes a retention setting for resolved conflicts but leaves recovery after retention open.” | Keep retention configurable, but close the unsafe gap: unresolved branches are not pruneable; retain at least the week plus recovery grace; archive and verify before pruning resolved history. Longer-term duration remains an owner decision. |
| “Validation would replay duplicate segments, interrupt saves, reconnect after competing deletion and photo addition, and restore a copied store. No checks have been run.” | Retain these scenarios and expand them with identity lifecycle, import bounds/corruption, clone split, photo staging, lost acknowledgments, unresolved-branch retention and operator comprehension. They remain proposals; no checks were run. |
| “A staged proposal should settle identity and durability before adding convenient merge behavior.” | Accept. Gate conflict UI and any automatic merge on identity lifecycle, idempotent import, local save/restart, package validation and delete safety. |
| “This is a provisional draft for review after the declared reveal, not an endorsed answer. Resolve material assumptions through applicable primary evidence; retain open user-data questions when they cannot be answered from sources.” | Retain the review status and evidence discipline. Documented alternatives inform requirements; they do not select the app’s engine or decide group policies. |
| “No future product deployment is requested.” | Retain. This deliverable is a research proposal only. |
| “Complete all substantive research and planning obligations within a maximum of 60 elapsed minutes. Finish earlier when the complete output is ready. There is no minimum research duration, no requirement to consume the allowance, and no credit for waiting. The deadline includes arm-specific setup, provider queueing after admission, tools, native retries, handoffs, revision and delivery. Output quality is assessed independently of elapsed time.” | Retain as a process boundary only; it implies no product behavior. This stage completed its proposal and evidence record early. |

## Bounded integration sequence and exit gates

1. **Inventory and settle the data contract.** Inspect the actual app language/runtime, database, transaction API, backup/restore flow and photo storage. Decide labels, note policy, tombstone/restore wording, photo identity/digest, package bounds, schema migration and retention. Exit only when one transaction can persist an operation and its view, or a reviewed recovery protocol exists. Do not select a library before this inventory.
2. **Build the local durable journal and view.** Add versioned operations, stable identity, replica lifecycle, causal frontiers, tombstones and a materialized view. Verify save/reopen and backup/restore without a network. Exit when injected interruptions on the chosen platform leave either the complete committed edit or none, with recoverable identity.
3. **Add bounded import/export.** Define the envelope, numeric caps, preflight validation, duplicate rules, pending ancestry, photo staging and restart recovery. Use the same segment over removable media and optional LAN relay. Exit when duplicates, out-of-order delivery, lost acknowledgments and interrupted imports preserve the operation set without arrival-order results or partial DB batches.
4. **Add review and explicit photo selection.** Present field conflicts, delete/edit, delete/photo, missing-file and restore choices in ordinary language. Keep source branches; never upload or copy bytes implicitly. Exit when each conflict-matrix row has a predictable, reversible outcome and status after restart.
5. **Pilot and size.** Exercise the three actual laptops with one disconnected for a week. Test replacement restore versus independent clone, then verify recovery from a backup. Measure 50,000 observations with realistic seasonal event volume and conflict density. Observe photo sizes and link speeds. Exit only after the group accepts recovery, performance, retention, support and manual-transfer instructions.

## Proposed failure-oriented validation

**Status: all rows are proposed validation. None was executed in this stage.**

| Boundary | Proposed exercise | Required result |
|---|---|---|
| Fresh install, restore, clone and replica split | Create two independent installs; restore one laptop as its continuation; clone a store and edit both copies; then exchange packages. Also edit before re-key in a controlled case. | Independent replicas get distinct IDs before ordinary edits; a replacement preserves the chosen history; divergent shared identity is quarantined; all pre-rekey operations remain available with uncertainty shown. No label or local counter overwrites another operation. |
| Operation-ID duplicate/collision | Replay identical operations and present the same ID with altered canonical payload. | Identical retransmission is a no-op. Changed payload is quarantined; neither payload is silently chosen. |
| Causality and arrival permutations | Produce concurrent histories on three laptops. Deliver in every relevant order, duplicate packages, and deliver children before parents. | Visible view and conflict frontier are deterministic independent of arrival order. Missing parents remain pending until complete. |
| Independent-field and same-field edits | Change confidence and notes from one base, then change the same field on two devices. | Only declared commuting changes combine; same-field values and common base remain reviewable. |
| Delete versus edit/photo | Delete on one device while another edits notes/confidence or adds/removes a photo link from an old base. Reconnect in both directions; include a missing file. | Tombstone stays active pending review; photo operation and file status remain visible; no ordinary edit, link, relay, or timestamp resurrects the record. Restore is a distinct explicit operation. |
| Lost acknowledgment and duplicate transfer | Stop after receiver DB commit but before acknowledgment; resend by relay and removable media; stop during transfer. | Import retries are idempotent; acknowledgment describes only durable receipt at its named hop; receiver is unchanged or has the complete DB batch. |
| Invalid, over-limit, or unsupported package | Truncate envelope/manifest, alter digest/length, exceed each configured cap, use unknown schema, add invalid IDs/parents, or point a relative locator outside the selected directory. | Full batch rejected before DB changes; no untrusted locator is followed. A valid reference-only operation can still be imported through a valid package without the file. |
| Included-photo transfer and restart | Interrupt at preflight, staging, size check, digest check, durable placement, DB commit, and acknowledgment. Restart and retry each case. | No committed reference claims a selected file is present before verified placement. Restart resumes or safely cleans incomplete staging; orphan cleanup never deletes source files. DB and file guarantees remain distinct. |
| Local power loss | Interrupt before and during each transaction phase on the selected database/build/platform/filesystem; reopen a copy and compare journal and view. | Committed operations reappear once, uncommitted ones do not, the materialized view can be rebuilt, and UI claims only the durability actually established. |
| Week-long disconnection and retention | Keep one laptop offline for seven days while the others edit, exchange, archive, reconnect and complete transfer after the agreed grace. Include unresolved branches and a retired-device workflow. | Every operation needed for catch-up remains available. Unresolved branches are not pruned. Archive restoration reproduces the stated recovery horizon. |
| Schema migration and restore | Import supported old-schema packages through a declared migration; reject an unknown version; restore a copied store and archive. | Migration is explicit and versioned; unknown schema is rejected without reinterpretation; restore produces a consistent journal/frontier/view. |
| Scale and operator understanding | Seed 50,000 observations plus measured seasonal event volume, realistic conflicts and observed photo metadata. Measure startup, search, import, backup/restore and transfer. Ask field staff to resolve scripted scenarios. | Evidence establishes actual capacity and usability for this group. No unsupported performance claim is made. |

## Owner decisions still open

1. Which existing store and transaction API can persist a journal operation and visible view together? Which language/runtime and backup/restore constraints apply?
2. What operation-ID and replica-ID encoding will be used, and who owns clone detection and re-key recovery? How is a replaced or permanently retired laptop authorized?
3. How are optional author labels chosen and shown without accounts: person, laptop, or both?
4. Do notes remain whole-field conflicts, become append-only note entries, or use a narrowly defined, tested text merge?
5. Who may restore after delete/edit or delete/photo, and is second-person approval needed?
6. What is the reconnection grace period, season-close/archive procedure, resolved-history duration, and policy for an offline/retired replica? What restore evidence permits pruning?
7. What photo ID, digest and directory layout will be used? Are files included only by per-transfer selection? What are the measured file-size limits?
8. What finite package, count, metadata and parser-work limits fit expected media and field hardware?
9. Is the optional office-LAN relay useful, and what local privacy, network, and backup constraints apply? Manual transfer remains required regardless.
10. What startup, search, merge, backup and transfer service levels are needed for 50,000 observations? Measure photo sizes and connection speeds before setting targets.

## Evidence and work actually performed

Stable source IDs preserve the investigator and critic identities in source-map.json. The reviser independently reopened consequential primary documentation for CouchDB/PouchDB conflicts and replication, SQLite Session Extension and atomic-commit assumptions, Automerge conflict/merge/storage behavior, RxDB conflict handling, and the PouchDB #8456 issue → #8460 code/test fix → 7.3.0 release chain. The issue/fix chain is specific to PouchDB’s IndexedDB adapter and is a candidate failure scenario, not a claim that this proposal or another adapter passes. Most documentation pages are current and unpinned; version/commit status and exact locators are recorded in the map.

The exact native Goal activation response was saved as native-goal-active.json; its binding guard passed before any case/source reading. The response exposes thread ID, active status, and raw createdAt/updatedAt values; their provenance and clock accuracy are UNKNOWN beyond that checker. No application code was downloaded or run, and no application, functional, import, security, performance, UI, or crash-recovery tests were executed. Validation above is proposed only.