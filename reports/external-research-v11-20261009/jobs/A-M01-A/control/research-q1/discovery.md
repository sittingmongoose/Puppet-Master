# Research discovery — field-inspections (A-M01-A / control / research-q1)

**Stage:** q1 architecture/data/storage/transport investigator. **Evidence kind:** full-discovery. **Status:** complete independent discovery; one input to the combined research, not the integrated final for the whole brief. q2 and the critic/finalizer are expected to add their complementary product-workflow and validation findings. No counterpart material was read.

## Brief and scope retained

The case is to build an **offline field-inspection app for a small housing nonprofit**. Twelve inspectors capture **forms, photos and location on Android devices**, often without service for a day; an office coordinator reviews corrections. Deployments should stay simple; export/migration should be possible without vendor lock-in. The investigation includes practical synchronization and conflicts, accessible forms, photo storage, selective sharing and a future small self-hosted deployment.

I investigated the full process obligations O1–O6 from the case brief while focusing on q1 architecture, data, storage, transport, and implementation/evolution conditions. The q2 product workflow/options and validation investigation remains necessary before a whole-case final. The input map declared no predecessors and no private source roots. Usage/billing was not inspected (null).

## Findings and options

### Local-first Android records and schema life cycle

For this use, offline needs a local read source and locally accepted writes. Android’s reference pattern uses an on-device source of truth and a separate network source; critical writes go local first and queue delivery [A01]. A Room/SQLite database is a straightforward Android fit for structured inspections and references. Keep local/network/external models separated and version the local schema: Room provides automatic and manual migration paths, but field/table removal and renames need explicit handling and generated schema history [A03].

A device-generated UUID is a practical stable key for inspections, answers, events and attachments; it avoids waiting for server IDs while offline and makes replay/deduplication possible. A durable local outbox should contain immutable operation/event IDs, target record, base server version, actor/device, local capture time, and delivery state. Preserve server receipt time separately from device time. Store when data was created, changed, submitted, returned for correction, and accepted so an offline clock cannot decide authoritative edit order.

A sensible inspection model is versioned form/template + inspection + typed answer rows + attachment metadata + append-only correction/review events. Each inspection retains the form version that created it. Local edits made during the day remain visible as saved, queued, sent, rejected, or needs-review. Do not equate saved with uploaded. Include structured GPS latitude/longitude, horizontal accuracy in metres, capture time, and a permission/unavailable state only if the product confirms location is required; position and photo metadata should be independently recoverable.

### Background transfer under a day-long outage

WorkManager can schedule network-constrained retry work, but its periodic interval has a 15-minute minimum, timing depends on constraints/system optimizations, and a run can be delayed or skipped while a condition is unmet. A constraint becoming false stops a running worker; retries happen when constraints return. The default retry backoff is exponential from 30 seconds (minimum custom delay 10 seconds) [A02]. These are scheduling defaults, not a delivery-time guarantee.

Keep the outbox and upload state in the durable app database, not only in a WorkManager request. On reconnect, reconcile/pull authorized reference changes, upload queued metadata/events and files idempotently, and only advance to acknowledged state after a server response. Offer manual retry and show last sync/error; a user must be able to continue inspection and review local records before that trigger runs. Photos should not block saving form answers. Their remote object acknowledgement must be distinct from answer acknowledgement so the office can see missing evidence.

Three practical transport paths emerged:

1. **Room + own API/outbox.** Android-native, few direct moving parts, backend and event semantics remain portable. The nonprofit owns retry/replay, pull cursors, authorization, conflict rules, migrations, monitoring and export. At twelve inspectors and intermittent rather than constant collaboration, a durable API queue is viable if engineering can test those cases.
2. **PowerSync + client SQLite + source database.** PowerSync’s service/SDK supplies SQLite-backed partial sync and a client upload queue; docs list Android support for its Kotlin Multiplatform SDK [P01, P03, P04, P05]. Self-hosting is Docker-based; its dashboard is unavailable on the self-hosted edition [P02]. This can reduce sync plumbing while preserving a relational source DB, but it does not remove the custom backend’s validation, idempotency, permissions, or conflict policy. Current docs mark Kotlin built-in attachments alpha and the Kotlin Room wrapper Beta. Pin/test the exact intended SDK before relying on either [P06].
3. **CouchDB document replication.** CouchDB exposes an HTTP document API, incremental/checkpointed peer replication and filtered partial replicas; offline replicas can resume after reconnect [C01, C04]. This is materially different from a REST outbox and is worth a prototype if preserving offline document revisions is valuable. The Android client/runtime/library fit was not validated, so support and effort remain open. Its per-document conflict behavior needs application work and its read granularity is a mismatch for selective property sharing (below).

No option was selected as a whole-product final. The evidence supports a Room-centered model with an independent HTTP/domain contract; a short PowerSync proof of concept is the most useful next comparison if its self-host/license/SDK maturity constraints are acceptable. CouchDB remains a distinct candidate rather than an assumed drop-in.

### Conflict policy must follow correction semantics

CouchDB keeps divergent leaf revisions and deterministically chooses a winner for default reads on every peer. Losing revisions remain accessible, and the application must explicitly merge/delete them to resolve conflict. Its docs warn that a background sweeper can make a successful-looking edit appear to disappear and later return [C02]. For a field inspection, deterministic winner selection does not say whether a housing-condition answer or office correction is substantively right.

PowerSync records PUT, PATCH and DELETE operations in its upload queue. The application supplies the backend endpoint, which must apply writes synchronously and idempotently. Its simple server-authoritative example uses delete-wins and per-field last-update-received-wins; custom conflict resolution remains application responsibility [P05]. A device timestamp must not silently override the backend receipt/approved revision.

Use append-only correction events or explicitly versioned inspection revisions, with expected base version and actor/role. Independent changes to different answers can merge when product rules allow; two competing values for one answer should enter explicit review. Coordinator corrections should be preserved with comment, actor and reason and should not erase the field inspector’s submitted value. A stale offline phone needs a visible resolution/reload path after reconnection. Whether coordinator acceptance freezes answers or permits more edits is a product decision, not inferable from this architecture review.

### Photos and location are separate data lifecycles

CameraX can save directly to a file asynchronously and gives distinct success/failure callbacks [A04]. On Android, app-private files are readable only by the app, while app-specific files are removed on uninstall [A05]. SAF lets a user choose file destinations and grant access for export/import [A06]. Keep sensitive inspection photos out of the shared gallery by default only if product policy treats them as app-managed records; use persistent private files rather than cache, save integrity metadata (random ID, inspection ID, MIME type, byte length, SHA-256, capture time, optional location), and make export/restore explicit. Revisit retention before promising photos survive uninstall or account removal.

Do not put large images into frequently edited inspection rows. Keep a photo as a separate immutable object or object-store item; store metadata and a stable reference in the record. Queue photo bytes independently, verify size/hash, and represent local-only, waiting, uploading, uploaded, failed, and deleted states. Recover partial files after process death and insufficient space. If the chosen sync product owns an attachment helper, prove it against actual Android lifecycle, privacy and export requirements; PowerSync’s helper is explicitly alpha and its documented Android example uses app-private files and an external storage adapter [P06].

CouchDB issue #5422 reports that on the reporter’s 3.4.2 environment, a repeated metadata revision reused a one-megabyte attachment stub and the replicated target grew from about 1 MB to 2 MB. The reviewed issue showed bug/needs-triage and no activity; no resolution or 3.5.2 fix was found in the reviewed release notes [C05, C06]. Treat this as a risk to reproduce for the exact release/attachment pattern, not proof every current replication duplicates every photo. It favors independent immutable photo records and a measured storage budget.

### Selective sharing is a server-side authorization problem

The coordinator needs broader assigned review scope than an inspector, while inspectors should receive only their assigned inspections and necessary reference/template data. Share minimum necessary data by a server-authoritative assignment/property relation. Every inspection, correction operation and photo URL must check identity, assignment/scope, role, status and operation. Removing a grant prevents future sync only after a device reconnects; an offline device can retain previously downloaded data, so local data minimization and a revocation/retention policy remain necessary.

PowerSync signed JWT identity claims (for example, auth.user_id) can filter sync; client-selected subscription parameters must be constrained by auth-derived membership conditions [P04]. Do not treat a user-supplied property ID as authorization. The upload API and file service must independently enforce scope; filtered rows do not protect an exposed endpoint or media URL.

CouchDB _security is database-wide: a member can read every document in that DB, while a new CouchDB 3.x database defaults to admin-only if access config is unset. validate_doc_update can control writes, and replicator selectors can filter transfer, but neither creates per-document read ACL for normal DB members [C01, C03, C04]. A shared DB with all inspectors as members cannot implement property-specific reads by selector alone. Separate DB boundaries or a different authorization architecture would need design and testing.

### Export, migration, and future self-hosting

Use stable UUIDs, documented field types, versioned form templates, explicit schema migrations, and a backend-neutral export bundle: JSON/CSV records plus original photos, a manifest with export/schema versions and counts, and hashes for every file. Import should validate versions/checksums before replacing or merging. The local Room DB is an operational working source; the export format is the portability promise.

If PostgreSQL is selected, pg_dump produces SQL or portable archives for a consistent single-database export while concurrent reads/writes continue; it does not include separately hosted object files and the official docs distinguish it from regular production backup [D01]. Back up database, files and keys together and rehearse restore. Keep form schema migrations and any sync config/API contract in version control.

PowerSync self-host may reduce app sync code but adds a service, DB, custom upload endpoint and separate file storage. The exact v1.23.0 service LICENSE is FSL-1.1-ALv2, with internal use explicitly listed and a future Apache 2.0 grant two years after a given version’s release; it also has competing-use and redistribution conditions [P07]. The release page showed v1.23.0 with abbreviated commit c406602 and later v1.26.1 listed as latest at source review; deploy a verified/pinned maintained tag, not unpinned latest [P08]. Management/legal review should establish that planned nonprofit/contractor use fits the grant. Costs and usage/billing were not observed.

CouchDB’s protocol is HTTP/1.1 and public REST based, making independent tooling possible, but implementing peer-replication semantics locally is material scope; do not call its data format a migration plan without an export/restore prototype [C01, C04]. In either architecture, export actual structured data and files, not only live replication state.

## Cross-topic dependencies for the combined investigation

- **Accessible forms:** persist incomplete answers and resume after process death; store template version with every inspection; leave labels, requiredness, validation timing, screen-reader/error flow, keyboard behavior and layout to the product/UI investigation. q1 schema must not make accessibility contingent on network.
- **Correction workflow:** correction state and immutable reviewer/inspector history must align with the coordinator’s actual handoff and acceptance rules; same-field concurrency policy needs a product decision.
- **Photo and location consent/retention:** decide who can view/download each file, whether it survives app uninstall, whether location is mandatory/optional, and how permission denial/poor accuracy is communicated.
- **Offline scope:** device must carry enough assigned forms, templates and lookups before going offline; work assigned while disconnected cannot appear instantly on that device.
- **Selective sharing/revocation:** previously delivered cached data cannot be recalled from a disconnected phone. Define retention, device loss and reconnect behavior.
- **Self-host responsibility:** identify who can update containers, rotate signing keys, back up/restore DB and files, and verify restore.

## Evolution evidence and uncertainty

CouchDB 3.5.2 release notes include replication scheduler/sequence changes (#5777, #5881) but do not list attachment-growth issue #5422. The issue capture showed bug/needs-triage and no activity; reporter’s version was 3.4.2 [C05–C06]. Conclusion is narrow: reproduce the attachment-history pattern and check a specific release/fix before production; current applicability is unknown.

PowerSync v1.23.0 released a fix for Sync Stream parameter queries involving wildcard-matched tables (#676) [P08]. This shows sync-query behavior evolves and supports a pinned upgrade regression check; it is not evidence about conflict resolution. Current docs mark Kotlin built-in attachments alpha and the Room wrapper Beta. Current status remains uncertain until a release and Android proof of concept are inspected.

Other unknowns: actual Android fleet/OS/storage mix; daily photo count and size; inspector overlap; assignment distribution; property-data sensitivity/retention; network security; hosting operator; engineering time; form churn; location precision/permission; and product-approved conflict policy. No runtime/hardware was available. Billing/usage is null.

## Executed observations vs proposed validation

**Executed:** read the exact input map and assignment, own-case brief, and public primary documentation, release/license pages, and issue report. Native Goal was activated. No product was installed, service started, app built, live sync/capture/import/export run, or implementation behavior tested.

**Proposed, not executed:**

1. **Offline durability:** seed assigned work, use airplane mode for 24 hours, capture/edit forms, photos and location; kill/reboot between saves. Pass if acknowledged local saves reopen intact, queue status stays truthful, and partial photo writes are recovered/detected.
2. **Replay/reconnect:** disconnect during metadata and photo upload; retry/restart/reconnect. Pass if event IDs deduplicate, hashes match, statuses converge, and no form/photo is lost or duplicated; measure battery/data/time.
3. **Conflict discrimination:** two phones edit same and distinct answers from the same base; coordinator requests correction; a stale phone reconnects last. Pass if same-answer conflicts preserve both versions and invoke chosen policy, independent-field behavior matches rules, and no correction disappears silently.
4. **Access boundary:** give inspectors different properties; try altered client params, direct API reads, replay after revocation, guessed attachment IDs and reused download URLs. Pass if server denies out-of-scope reads/writes/files; record what an offline phone retains.
5. **Export/migration round trip:** export records, all photos and manifest; restore into a fresh self-hosted environment/new app version; compare counts, form versions and SHA-256. Corrupt/incompatible bundles must fail without damaging live data.
6. **Capacity/retention:** capture a realistic maximum day of photos, low-storage condition and backlog; estimate 12-device/server growth from measurements; verify cleanup never deletes unsynced evidence.
7. **Schema evolution:** open drafts and pending events across two app/form versions; migrate additions, renames and deprecations. Pass if no pending data drops and historical forms remain interpretable.
8. **Accessible offline flow (q2 integration):** test TalkBack, large font, keyboard, errors, save/resume, correction comments and attachments offline. Record failures; not run here.
9. **PowerSync gate:** pin SDK/service; verify Kotlin/Room/attachment status; self-host cleanly; test JWT scopes, synchronous/idempotent writes, correction UI, file authorization, backup/restore, upgrade and wildcard-query regression for PR #676.
10. **CouchDB gate if shortlisted:** prove intended Android client; inspect concurrent revisions; test selector versus direct reads; repeat #5422 stub/replication size sequence on exact release; rehearse resolution and export/import.

These are discriminating proposals, not executed results.
