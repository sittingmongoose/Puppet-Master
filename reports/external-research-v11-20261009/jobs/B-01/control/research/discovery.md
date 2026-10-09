# B-01 research discovery — I01

**Scope:** one-route pilot for a two-terminal island ferry operator; 36 staff; shared tablets with large text; storm-related connectivity loss; dispatcher sometimes on paper for half a shift; initial ceiling $9,000 and annual ceiling $1,800. This discovery was completed from the brief and public primary sources before the case plan was revealed. It does not use the unrevealed plan as a research prompt.

## Executive finding

The core design problem is admission control for scarce capacity during a network partition, not merely offline form entry. A local database or offline cache can record work while disconnected, but two terminals that cannot communicate cannot both know what the other has accepted. If each terminal can freely confirm every apparently free slot from its own stale view, duplicate vehicle reservations or capacity oversubscription remain possible. Sync later can reveal the collision; it cannot undo a boarding promise.

Preserve the general manager’s unresolved authority choice. A safe, lower-risk pilot default is one authoritative confirmed schedule when terminals can reach it, with disconnected entries explicitly marked **provisional** until reconciliation. If the operator requires offline confirmation, reserve disjoint per-terminal admission quotas for each departure and capacity dimension before the outage, so each terminal spends only its assigned entitlement. This can reduce utilization and needs vessel/route rules, a reallocation procedure, and a clear response when a quota runs out. Do not label a local cached write as a globally confirmed booking.

The strongest new product lead is Hogia BOOKIT, which is explicitly ferry-focused and advertises capacity, check-in, quick-sales, reporting, and API modules [S06]. It may reduce custom scope and support load, but public information does not establish its offline mode, contract price, or fit for a small two-terminal island operator. A practical pilot should request a demonstration and full quote before either buying or building.

## Independent mechanism discovery

### 1. Ferry-specific commercial platform: Hogia BOOKIT

Hogia’s vendor page describes booking for passenger, vehicle, and freight records, route/capacity management, touch-screen quick sales, check-in, manifest and revenue reports, modular features, and a comprehensive API [S06]. That is a much closer domain starting point than a generic reservation form. The page does not state a license/implementation/support cost, a supported minimum operator size, disconnected operation behavior, two-node conflict rules, wheelchair-assistance privacy, export formats, or current deployment options. Its public page calls the product client/server on .NET Framework, a potentially dated statement that must be verified directly. Treat BOOKIT as an RFP/demo candidate, not a selected solution or a claim of affordability.

### 2. Managed cloud client with local cache: Cloud Firestore

Firestore is a contrasting approach: managed backend and SDK-managed client cache rather than operating a sync server. It supports local reads/writes and reconnect synchronization, with last-write-wins for edits to the same document. On web, durable offline persistence is opt-in, supported only by Chrome/Safari/Firefox, and cached data persists between sessions unless the application manages it [S03]. Queries offline are limited to cached records; the empty-result behavior means a missing local row cannot prove a sailing has free capacity. Automatic local query indexing is off by default, which may matter after prolonged use of a large cache [S03].

Firestore transactions retry after concurrent modifications and are atomic when they reach the service, but the transaction fails when the client is offline [S04]. Therefore the backend can enforce a shared capacity invariant during connected booking, but an offline terminal still needs a provisional/queue policy or preallocated quota. It cannot rely on a queued client write or a stale query to promise shared vehicle capacity. For shared tablets, persistent cache behavior is a concrete passenger-data exposure concern: minimize personal fields locally, separate public display from staff records, define per-worker sign-in/locking, and validate data removal/retention before use.

Pricing is usage-based across reads, writes, deletes, index reads, storage, and network transfer. The current official page gives daily free quotas for the qualifying database (50,000 reads, 20,000 writes, 20,000 deletes, 1 GiB stored data, and 10 GiB outbound transfer/month), but that does not include implementation, device/service support, or a tailored guarantee [S05]. No usage quantities or region are given, so a reliable annual cost is not calculated.

### 3. Local-first replicated databases: PouchDB/CouchDB

PouchDB with a CouchDB-compatible backend offers independent local databases and two-way replication; live sync can retry network loss and emit paused/active events [S02]. That supports terminal operation during intermittent connectivity. It also shifts more technical responsibility into the app and operator/vendor: retry state, backups, user/device isolation, conflict queue, software upgrades, and support. The docs expose immediate 409 revision conflicts and later offline same-document divergence. On reconnect, the library picks a deterministic but arbitrary winner by default and preserves losing revisions for explicit resolution [S01]. The application must inspect and resolve relevant conflicts; default winner selection is not a business rule.

An append-only operation history (one reservation-created, changed, cancelled, boarded, or manifest-correction event per immutable ID) reduces destructive overwrites and supplies provenance. Give each event a terminal identifier and unique event ID/sequence, then derive current booking state from events; it still needs an explicit capacity rule. It should not update the entire reservation document with “last write wins” for important changes. A local-first implementation is technically feasible but likely raises the support burden for a no-IT operator; budget that work explicitly.

### 4. Preallocated local capacity entitlements

A materially different alternative to optimistic multi-master booking is to divide each departure’s finite bookable capacity into entitlements by terminal (and, if needed, by vehicle-length/space class and passenger seats). Each isolated terminal can confirm only against its remaining entitlement; if a reservation exceeds one class, it consumes the applicable measured units. A central dispatcher can allocate/reassign unused entitlements while connected and reconcile after reconnect. This is an application/business policy, not a magic feature provided by PouchDB or Firestore. It trades utilization and flexibility for a bounded overbooking risk. To be safe, the model needs the vessel’s authoritative capacities, unit conversions, protected emergency/service space, a maximum outage interval, rules for moved/cancelled sailings, and an operator-approved quota-exhaustion path.

### 5. Paper-backed outage procedure

The current paper manifest already has operational value during a half-shift dispatch outage. Retain a deliberate paper path for the one-route pilot even if the digital application works offline: print/snapshot a time-stamped manifest, assign a unique local sequence to each new or altered record, label local changes with terminal/time/operator, and reconcile those entries once a link or authorized dispatcher is available. Paper is an outage control, not a second authoritative ledger; count and reconciliation steps must prevent a written reservation being entered twice.

## Cross-cutting discovery and consequences

- **Vehicle and passenger capacity are multidimensional.** The reservation must represent sailing/departure, vehicle footprint/oversize class, linked passenger count, and walk-on count. Exact units and limits depend on vessel and loading policy, which the brief does not supply. Do not use a single generic “seat count” if vehicle deck space is the binding resource.
- **Day-of changes are operations events.** Cancellation, late vehicle change, sailing time/vessel swap, and reassignment must be visible as dated events to both terminals and dispatch. A storm-time change while terminals are isolated requires a defined command path (radio/phone, dispatcher paper, or local provisional notice), not just a sync retry.
- **Privacy applies to operational UI too.** Public queue displays should use a non-identifying queue token or vehicle marker, never passenger names/contact details. Put assistance and oversized-vehicle details only on the staff view needed to load the vehicle; avoid broadcasting a wheelchair label to the public. Store only the information the crew needs, and test the display separately from the booking record.
- **Accessibility and training.** Test the complete reservation, check-in, and manifest flow with OS text enlarged, landscape/portrait tablet use, touch-only entry, and a short seasonal-worker task guide. This is proposed, not a standards-compliance finding.
- **History and exit.** Require a dated audit trail and periodic export of reservation history, changes, daily reports, and any linked files in a documented non-proprietary format. Test that an export can be read without the vendor’s UI and can restore the pilot’s sample records. Confirm which material is included in the vendor contract or managed cloud service.
- **Budget and operating burden.** Compare initial configuration/development, devices, training, support and contingency against $9,000; compare license/hosting, storage/network use, backup, support and renewal increases against $1,800/year. No price was inferred for Hogia or estimated for Firestore without a quote/workload. A custom sync service may have low per-operation charges but nontrivial engineering and on-call cost.
- **Pilot boundary.** Start with one route and its actual departure/capacity rules. Model route and departure as data keys from the start so a second route can be added later, but do not buy or build broader yield, loyalty, freight, or multi-route features until the pilot proves them useful.

## Issue/fix/release evidence

A relevant PouchDB evolution chain is documented: the upstream 8.0.1 release page says a bug came from a refactor in the prior release and connects refactor #8450 to the `changesHandler` this-binding fix [S08]. Issue #8581 records a Chrome/IndexedDB two-window storage-event reproduction and later fix/test commits; the release notes identify 8.0.1 as the patch carrying that change [S07][S08]. This is relevant to a browser-local database that exposes synchronization status across shared tablet windows, and supports pinning and regression testing. It is not evidence of a current-release defect or a ferry-specific bug.

## Important unknowns to resolve in procurement/design

1. Which vessel/departure limits bind: passenger places, vehicle spaces/length, weight, loading lane, accessible equipment/staff, dangerous goods, or combinations? What units and protected space apply?
2. What precisely is disconnected in the storm scenario: internet/cloud, a shared LAN/server between terminals, radio/phone, or more than one? How often and how long? Can a dispatcher still coordinate them?
3. When disconnected, may a terminal take only provisional entries, or must it be able to promise a confirmed vehicle space? If local confirmation is required, how much capacity should each terminal control and what happens when its share is exhausted?
4. Are online reservations/public self-service or payments in scope, or only staff reservations, walk-ons, and manifests? What are peak daily volumes?
5. Which passenger fields are truly required for booking and boarding? What public queue display is planned, who can see staff views, and what are local retention/record obligations? No jurisdiction is specified, so no legal regime is presumed here.
6. Which reports, export/backup formats, customer support and service availability does the manager require? What is the five-year cost ceiling and exit condition?

## Evidence status and limits

Research sources and their scope are indexed in [sources/README.md](sources/README.md) and [source-map.json](source-map.json). Vendor documentation establishes vendor claims only. The Firebase and PouchDB sources are product documentation, not executed application tests. No runtime or ferry capacity data was supplied, and no code was run. All architecture checks and validations remain proposals.
