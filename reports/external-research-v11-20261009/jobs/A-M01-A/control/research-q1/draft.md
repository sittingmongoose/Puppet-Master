# Research draft — field-inspections (A-M01-A / control / research-q1)

**Status:** complete planning draft for the q1 architecture/data/storage/transport research. This is an input to the combined case work, not a whole-case final; q2 product workflow/options, the critic, and finalizer still need to integrate their work. I read only the own-case revealed plan after discovery/source-map had been saved and frozen. I did not read parent, counterpart, evaluator, or history material.

## Per-plan disposition

The dispositions use the case vocabulary: correction, optional enhancement, user decision, already-covered, rejected, and uncertain. A clause may need more than one status when it combines an implementation choice with an unresolved product choice.

### P1 — “Use a PWA and browser local storage for all offline records.”

**Disposition: uncertain; user decision; correction to persistence recommendation.**

The case is specifically an Android field app. Android’s current architecture guidance says network-backed repositories need a local data source and describes a persistent local database/files as the offline read source; the reference pattern supports Room for structured records [A01, A03]. A PWA remains an optional delivery route if cross-platform deployment is valuable, but this research did not establish browser localStorage quotas, eviction, transactional behavior, attachment storage, or device lifecycle. Do not make browser localStorage the canonical repository for “all” inspection data without a device proof. Prefer Room/SQLite plus app-managed files for the Android baseline; if Jared chooses a PWA, separately compare IndexedDB and browser persistence semantics and test on the nonprofit’s target Android browsers. The product/platform choice remains open.

### P2 — “Upload complete inspection JSON on reconnect with last-write-wins.”

**Disposition: correction; reject general last-write-wins.**

A complete snapshot can overwrite another editor’s changes unless the server detects the base version and keeps a history. Neither a last-device timestamp nor arrival order means the submitted condition is correct. CouchDB intentionally preserves concurrent revision branches and leaves semantic conflict resolution to the application [C02]. PowerSync’s simplest server-authoritative policy is per-field last update received, with delete-wins; its docs still put validation/conflict behavior in the application backend [P05]. Use locally durable, idempotent event/patch uploads with stable UUIDs, expected base version, actor and server acknowledgement. Preserve every inspector submission and coordinator correction. Automatically combine distinct answers only where product policy allows; same-answer conflicts should be visible and reviewable. LWW can remain an explicit user-approved rule for clearly low-risk fields after conflict scenarios are tested.

### P3 — “Store photo URLs in each form.”

**Disposition: correction; rejected as the complete photo-storage design.**

A URL alone cannot serve an image captured offline and does not prove that its content was uploaded or remains authorized. CameraX writes asynchronously to a file and reports success/failure; Android app-private files persist as app files but are removed when the app is uninstalled [A04, A05]. Keep original bytes in a durable local file, store attachment ID/inspection ID/MIME type/size/hash/local state separately, and queue upload independently from answer JSON. Use a stable opaque remote object ID in record metadata; obtain an authorized download URL when needed. Provide export/restore for original files and record photo visibility/retention policy. PowerSync offers a file queue outside the database, but its documented Kotlin helper is alpha, so prove its Android lifecycle and storage adapter before adopting it [P06]. A remote URL may be one transport locator after upload, not the sole offline record.

### P4 — “Add coordinator review and CSV export.”

**Disposition: already-covered in the case brief; correction and user decision for completeness.**

The brief already requires the coordinator to review corrections and requires export/migration without vendor lock-in. Preserve this direction. Specify correction events/statuses, reviewer identity/reason, version presented to the inspector, and how returned work is re-opened or accepted. A CSV alone does not preserve typed forms, form-template versions, correction history, file bytes, or authorization scope. Add a versioned manifest plus JSON/CSV records and original photo files with hashes; define whether export includes every assigned property, only the current inspector’s data, or a coordinator archive. Room requires explicit schema migration history [A03]; PostgreSQL pg_dump provides consistent portable database exports but only for a single database and does not capture separately stored photos [D01]. Which export scope and retention policy the nonprofit wants is a user decision.

### P5 — “Defer access control beyond individual sign-in until rollout.”

**Disposition: reject; correction.**

Selective sharing is in the original brief and must be part of the first usable release. Sign-in answers who the user is; it does not decide which buildings, inspections, answers or images that person may read or change. Enforce inspector assignment and coordinator review scope in server authorization for row reads/writes and photo access. Sync only necessary assigned rows. PowerSync supports auth-derived JWT filtering and shows how a client-selected subscription must also satisfy user membership [P04]; its upload API and file URLs still require independent authorization [P05, P06]. CouchDB members can read all documents in a database, so a shared DB’s selector is not a read ACL [C03, C04]. Test altered IDs, direct endpoints, cached offline data and permission revocation before rollout. The exact staff-role matrix, revocation handling and offline retention window remain user/product decisions.

### P6 — “Test by toggling network off and on.”

**Disposition: already-covered as one smoke check; optional enhancement and correction to validation coverage.**

A network toggle is useful but cannot show one-day durability, interrupted photo upload, process death, replay, concurrent correction, access isolation, schema migration, accessibility or restore. Keep it as a small connectivity smoke case; add discriminating checks in the validation section below. None of those checks was executed in this assignment.

## Coherent q1 recommendation and conditions

The preferred baseline to prove is a Kotlin Android app using Room/SQLite for locally readable inspection/template/outbox state, persistent app-private photo files, and a small authenticated HTTP API with a relational system of record (PostgreSQL is a portable candidate) plus separately managed file storage. This keeps offline operation and the domain contract independent of a proprietary sync protocol. The app records edits locally in one transaction with a durable outbox event and does not show an upload as accepted until server acknowledgement. Use UUID identifiers generated on device so new work can exist before a connection.

For work scheduling, use network-constrained WorkManager jobs and retry/backoff, with manual sync and database-visible queue state. Android’s documented periodic minimum is 15 minutes; system constraints can delay or skip a run, and default retry backoff is exponential from 30 seconds. The app must not depend on a timer firing at a precise hour [A02].

Inspection schema should preserve the form version and answer types used at capture. Represent correction/review as append-only records with actor, role, event time, server time, base version, reviewer reason and status. Store camera file state independently. Keep GPS coordinates, reported accuracy and capture time separate from address text; whether a location fix is mandatory and what precision is sufficient are product decisions.

Use an idempotent server endpoint that authenticates the actor and verifies property assignment/status for every event and attachment. Same-field conflict must retain both inputs and become review work; never silently discard an inspection answer. A server-owned version counter or conditional write prevents stale snapshots from overwriting newer revisions. Distinct-field merging is conditional on user-approved rules.

Retain two alternatives for prototype comparison:

- **PowerSync:** current docs show Android/Kotlin support, client SQLite, SQL-like per-user partial sync, upload queue and a self-hosted Docker service. The self-host page says its dashboard is unavailable. The app backend still applies writes synchronously/idempotently, and default conflict guidance is server receipt-order LWW per field [P01–P05]. The Kotlin Room wrapper is Beta in the docs index and built-in attachment helper is alpha [P06]. Service version v1.23.0 uses FSL-1.1-ALv2; internal use is listed, but competitive-use and redistribution terms apply, with a per-version future Apache grant after two years [P07]. This may reduce sync coding but brings an operating service, source/license review and evolving sync configuration. Do not accept marketing “open-source” as a substitute for reviewing exact service license, supported tag, versioned SDK status, and self-host work.
- **CouchDB:** offers HTTP document storage, checkpointed bidirectional offline replication, partial replicas and retained concurrent leaf revisions [C01, C02, C04]. Choose it only if the team accepts a document model, proves an Android-compatible client, resolves document branches as domain events, and accepts its database-wide member read scope or creates stronger isolation boundaries. Issue #5422 reports attachment expansion from roughly 1 MB to 2 MB for one stub-reuse sequence in CouchDB 3.4.2; no fix was observed in the checked 3.5.2 notes, so the exact target release requires a reproduction and capacity test [C05, C06].

For future portability, define a product-owned export: versioned manifest, machine-readable form/inspection/correction data, original files, counts and SHA-256 digests. Include an import validation path. A PostgreSQL dump complements this bundle for full backend recovery, but it is not a substitute for photo backups or cross-system export [D01]. Whoever takes self-host responsibility must own updates, TLS/secrets, backups of database and files, restore rehearsal and monitoring. The team size and operational capacity were not provided, so no “simple” service can be selected on staffing assumptions.

## Retained requirements, conditions, alternatives, and open decisions

The constraints remain twelve Android inspectors, up to a day offline, forms/photos/location capture, coordinator correction review, simple deploys, non-vendor-locked export/migration, accessible forms, selective sharing and future small self-host. No change to those requirements is proposed.

Open decisions for the combined work/user review:

1. Is Android-native Kotlin the intended first release, or should a PWA be evaluated for deployment/reach?
2. What workflow does “coordinator reviews corrections” mean: review before final submission, return-to-inspector loop, immutable acceptance, or continued edits?
3. Are two inspectors allowed to edit the same inspection? Who wins/approves concurrent values?
4. Which properties/inspections may each inspector and coordinator read; what happens to already-downloaded data after reassignment or account revocation?
5. Are images private to the app until explicit export, or should users see them in system media and retain them across uninstall?
6. Must GPS always be captured? What should happen with no permission, no fix, coarse accuracy or stale location?
7. What bundle formats, export scope, retention and import/merge behavior meet migration expectations?
8. Who operates the future self-hosted service and object store; what is the acceptable Docker/DB/backup maintenance burden?
9. What scale limits matter for image count, image size, offline duration and device free space?
10. Are third-party sync-service licenses acceptable for the nonprofit and its contractors?

Other uncertainties are enumerated in the frozen discovery. Usage/billing remains null because it was not investigated.

## Validation plan (proposed, not executed)

No Android runtime, representative device or application/backend was available. The only executed work was source inspection; there are no test results.

1. **Day-offline durability:** provision assignments/templates, disconnect for 24 hours, capture/edit records, kill/reboot during the day, and reopen. Pass only if acknowledged local saves and state markers are correct and unsent data remains intact.
2. **Partial file/capacity:** interrupt CameraX completion, fill storage, kill during capture/upload; verify file hashes, orphan recovery, and no cleanup of unsynced originals.
3. **Retry/idempotency:** interrupt metadata and file uploads at several byte/transaction boundaries, restart workers, replay the same event ID. Pass if server has one logical event, file bytes match hashes, and UI reaches a truthful settled state.
4. **Same-field and cross-field conflicts:** two inspectors edit same answer, different answers, and coordinator correction from a shared base while offline. Reconnect in both orders. Pass if same-answer conflict is retained and follows explicit policy; independent fields behave as specified; reviewer corrections remain visible.
5. **Authorization:** vary identity, property/inspection IDs and subscription parameters; attempt direct reads/writes and guessed/reused file links; revoke a grant while device is offline then reconnect. Pass if server blocks every new out-of-scope operation and documentation records what remains cached offline.
6. **Export/import/restore:** export a representative inspection set including image files and correction history; restore to a clean database/app version; compare counts, template versions and every hash. Corrupt an image and manifest; import must reject without partial replacement.
7. **Schema/form migration:** preserve open drafts and queued events through versions with field additions/rename/removal and template changes. Test the explicit historical display of old submissions.
8. **Accessibility/network intersection:** TalkBack, large text, keyboard traversal, validation/error summaries, draft recovery, correction comments, photo flow, and location denial while offline. Accessibility and workflow details belong to q2; this proposal is an integration point.
9. **PowerSync gate if selected:** pin current maintained service and SDK; verify self-host without dashboard; test signed JWT scopes and modified client parameters; confirm Room wrapper/attachment maturity; validate synchronous and idempotent backend response, file authorization, backup/restore and upgrades. Include the v1.23.0 wildcard Sync Stream regression fixed by PR #676.
10. **CouchDB gate if selected:** demonstrate supported Android local runtime and one-day replication; inspect all revision branches; prove a regular DB member cannot read unrelated inspections only if stronger isolation is configured; reproduce issue #5422’s attachment-stub sequence on exact release; measure compaction/disk growth and export/restore.

All items above are proposals. WorkManager settings, conflict semantics, sync selection, attachment status and export integrity need implementation-level verification before release.
