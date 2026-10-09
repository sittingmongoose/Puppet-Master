# Evidence-first investigation — I01 / B-01 treatment

Prepared before opening the predecessor draft or revealed plan. This is independent research from the supplied brief and public primary sources. The cited documentation describes mechanisms; it does not establish that any implementation, hosting offer, price, service level, or local deployment has been tested for this operator.

## The brief's fixed requirements and unresolved policy

The operator has two terminals, 36 desk/lane/dispatch staff, shared tablets with large text, unreliable cellular service, and a dispatcher who may rely on paper for half a shift. The current sheet-based ledger makes duplicate vehicle reservations and late accommodation notes hard to detect. The product must capture vehicle reservations, walk-on passenger counts, day-of sailing changes, wheelchair assistance and oversized-vehicle flags; public queue displays must not expose passenger details. Initial spend is capped at $9,000 and annual spend near $1,800; there is no dedicated IT employee. The pilot is one route, should preserve a credible path to route two, provide useful daily reports, train seasonal workers briefly, and permit history export/exit.

The central product decision is explicit and unresolved: when disconnected, is a terminal allowed to confirm a reservation locally, or is a central authority the only source of confirmation? “Offline-capable” does not settle that policy. Any plan that claims both independent confirmations and a hard global no-duplicate guarantee during a partition needs a coordination rule, preallocated inventory, or a qualified tentative state. A sync engine alone cannot make disconnected terminals observe each other's new bookings.

## Discovery: materially different mechanisms

### 1. Local-first document replication: PouchDB on each client, CouchDB for shared replicas

CouchDB's own 3.5 documentation describes incremental, checkpointed replication that resumes after interruptions and supports subsets/partial replicas; it is designed for intermittently connected copies. PouchDB implements the CouchDB replication algorithm for local browser databases. This is a strong candidate to prototype when staff must keep working during a long cellular outage and reconnect later. CouchDB is multi-master/eventually consistent, not a central lock service. Concurrent edits can create conflict branches; CouchDB chooses a deterministic winner so replicas converge, but the application remains responsible for resolving a conflict in business terms. A winning document may omit values carried by a losing branch from ordinary views. Model reservation actions as separate, auditable records where practical and put consequential same-key conflicts into an explicit dispatch work queue. Avoid treating deterministic revision choice as “first confirmed reservation wins.”

### 2. Managed cloud database with local persistence: Cloud Firestore

The official Firestore documentation supports offline cache reads/queries and queues writes while offline, then synchronizes on reconnection. For multiple changes to the same document, its policy is last-write-wins; cached queries may be empty or incomplete when rows are not cached, and cache data is explicitly marked potentially stale. Firestore transactions fail while offline. This may reduce server-operations burden and fit a no-IT operator, but its built-in offline write path does not provide an offline atomic capacity check across the two terminals. It is a viable alternative if offline entries are explicitly pending/tentative, or if an authoritative central check is required before confirmation. Cloud accounts, billing, privacy/access configuration, current price and data residency need direct evaluation; none is observed here.

### 3. Embedded relational files and changesets: SQLite Session Extension

SQLite's official Session Extension records table changes into changeset/patchset blobs and applies them to another database with the same schema and compatible starting data. The feature requires declared primary keys, is disabled by default at build time, does not capture virtual tables, and exposes conflicts/constraints to an application callback with choices such as omit, abort or replace. It demonstrates that disconnected relational edits can be captured and reconciled, but it is a low-level primitive rather than a ready-made secure synchronization service: a ferry pilot would still need delivery/retry/acknowledgement, schema versioning, deduplication, merge UI, backups, permissions and upgrades. It is an option if the team accepts building and supporting that protocol; with no dedicated IT employee it carries appreciable integration/maintenance risk.

### 4. Central-authoritative thin web client with an offline journal

A conventional central API/relational database is simpler to reason about when the operator prioritizes one authoritative booking ledger. A local journal can preserve edits during a link outage, but the product should show “pending—not confirmed” until the central authority accepts them. To permit independent confirmations during an outage while keeping a hard capacity bound, preallocate per-terminal/sailing quotas or other non-overlapping tokens before the outage; otherwise the policy must permit overbooking/exception resolution. This approach is a product/operations alternative, not a guarantee supplied by the brief.

## Evidence-backed relation / condition / release graph

- If a local copy is readable and writable during disconnection, the client can keep desk and dispatch work moving; that local success says nothing about what another isolated terminal accepted.
- If PouchDB/CouchDB replication reconnects, incremental synchronization can converge document histories after an interruption. If two replicas changed one document from the same prior revision, there may be multiple leaves and a deterministic winner plus accessible losing revision; the application must decide whether to merge, retain, or ask dispatch. The algorithm's stable winner is a replication invariant, not a reservation-priority policy.
- If the operator chooses central authority, a stale/offline cache cannot validate global vehicle availability. A write must remain pending until server acceptance; offline transactions are not supported by Firestore. If the operator chooses local confirmations, duplicate same-sailing vehicle IDs become an expected conflict unless inventory is partitioned or overbooking is accepted and surfaced.
- For walk-on passenger totals, additive per-terminal counts or uniquely identified boarding events could be easier to merge than editing one shared counter. This is a proposed data model, not a property automatically guaranteed by the products. Reconciliation must be idempotent so a retried sync does not double-count.
- For late assistance/oversize notes, model assistance and vehicle-size facts separately from public queue display payloads. Restrict public view to sailing, position/vehicle status and the minimum accessibility cue the crew needs; test that passenger name/contact/booking notes never appear. Source docs establish sync behavior, not compliance or correct access control.
- For day-of change and half-shift paper fallback, preserve a timestamped audit/event journal, show local/server freshness, make unsynced work obvious, and support a controlled paper-manifest import/reconciliation. These are requirements to validate, not documented capabilities attributed to any candidate.
- Exit/history requirements require documented export of bookings, changes, counts and conflict resolution history in an operator-readable format, plus a restore/import exercise. Choosing a database does not prove portability.

## Issue / release / evolution evidence

A primary Apache CouchDB issue (#5879) reports instability after a 3.4.2 to 3.5.1 upgrade under a very different workload: a high database/shard count, compaction or shard movement, and an approximately 8 GB node; the reporter describes OOM events and cluster unavailability. The issue page was observed as open / needs-triage. This is a credible warning to test any selected release and to avoid assuming a self-hosted cluster is zero-maintenance, but its scale and conditions do not establish that a small single-route deployment will reproduce it. The official project site identifies 3.5.2 (2026-05-19) as a later release; I did not establish that 3.5.2 fixes #5879, so no such fix is claimed. The issue is about server upgrade operations, not replication's conflict semantics. For a no-IT operator, managed hosting or a simple, monitored single service may be preferable if cost, backups, privacy and support fit; these alternatives remain to price and verify.

## Provisional recommendation and decision points

Do not lock product scope around “central” versus “local” before the general manager and dispatcher choose the meaning of confirmation. Bring two explicit policy choices to pilot design:

1. **Central-authoritative:** confirmed means accepted by the shared authority. Offline entry is queued and visibly pending; optionally reserve a pre-issued terminal quota to permit bounded offline acceptance.
2. **Locally confirmable:** either terminal can accept while isolated. The UI must disclose provisional status/possible overbooking; on sync, conflicts go to a dispatcher exception queue with both records preserved and a recorded resolution. No silent last-write-wins for vehicle allocation.

For either choice, prototype a small local-first client and compare it with a managed offline cache, using one route and synthetic data. Gate pilot acceptance on demonstrated lost-link workflow, same-vehicle/same-sailing collision behavior, safe public queue projection, day-of changes, walk-on count idempotence, assistance handoff, report correctness, large-text shared-tablet usability, recovery from paper, backup/restore and complete export. Ask vendor(s) for line-item quote against the $9,000/$1,800 caps and for account/backup/support responsibilities. No runtime, vendor quote, deployment, security review, or user validation was available or executed for this research.

## Source navigation

Primary-source detail and the exact access trail are in [sources/index.md](sources/index.md) and [source-map.json](source-map.json). The source IDs below are immutable references for this arm.
