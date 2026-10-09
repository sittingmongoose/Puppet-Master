# I01 — final pilot recommendation and plan adjudication

**ER11 B-01 treatment / critic · 2026-10-09**

## Recommendation

Run a one-route qualification and pilot plan before selecting a system. Start with two ferry-specific vendor demonstrations—PDMS Compass and Access One Voyage—because their public pages make explicit offline-operation claims. Use Zaui as a connected-inventory and onboarding comparator. Keep FerryCloud as a lead only after confirming its present status: the public product and pricing pages show 2019 date markers and quote-only pricing. A numbered paper manifest with a named dispatcher who owns reconciliation remains a real continuity option. These are leads, not endorsements: no vendor demonstration, quote or system test was conducted.

The manager and dispatcher must define what “confirmed” means when the terminals cannot reach one another. An offline database can preserve a local entry; it cannot let the second terminal see that entry during a partition. If zero overbooking is required, a booking must wait for a common authority or each terminal must receive a non-overlapping share of capacity before losing contact. Unrestricted local confirmations can keep service moving, but explicitly allow two terminals to promise the same remaining space. Synchronization cannot erase that trade-off.

The budget is up to $9,000 initially and about $1,800 annually ($150/month total). If all 36 staff needed paid seats, that recurring amount would average $50 per staff member per year before hosting, support, hardware, printer media, backup, payments, training and integrations; actual licensing is unknown. Require written all-in quotes and identify who owns backups, support, device replacement, updates and data export. With no dedicated IT employee, a hosted vendor may fit better than custom synchronization if the operator’s outage rule, data handling and full cost fit. That is a conditional inference, not a verified purchasing result.

## Required policy choices

1. **Central authority:** a shared service or dispatcher alone issues final confirmations. An offline terminal may record a request and give a numbered receipt, but must label it pending/provisional until accepted. Staff can still record walk-ons, day-of changes and accessibility facts locally; define which records can be acted on before sync.
2. **Preallocated terminal quotas:** before the outage, reserve non-overlapping capacity shares for the terminals, by the vessel’s real capacity dimensions. Either terminal can confirm within its allotment. Unused slots may be reassigned only after communication resumes. This bounds overbooking at the cost of possibly stranded capacity.
3. **Local acceptance with reconciliation:** either terminal may accept a request from its last known view. The interface must disclose that duplicate or over-capacity bookings may result; keep both requests and route the outcome to dispatch for a recorded resolution and customer remedy. Do not silently discard a request through a last-write-wins rule.

These rules concern global capacity. They are separate from edits to the same reservation. A database may flag two edits to one shared record and still fail to notice two distinct reservation IDs competing for one slot. Test both cases.

## Product and technical alternatives

| Option | Evidence and fit | Limits and conditions |
|---|---|---|
| **PDMS Compass** | Vendor describes inter-island/multi-vessel ferry configuration, central booking visibility, printed tickets and online/offline port ticketing ([official page](https://www.pdms.com/platforms/compass/), C01). Strong demonstration lead for poor connectivity. | Public page does not establish two-terminal offline inventory allocation, duplicate resolution, privacy of queue displays, export format or price. Ask for its exact offline transaction list and run the split-inventory test. |
| **Access One Voyage** | Vendor describes local authorized operations with later synchronization, Windows terminal and Android mobile workflows, hosted or operator deployment, and configurable audit/security controls ([official page](https://accessonevoyage.cyrabyte.com/), C02). | “Authorized operations” is not itemized; no public simultaneous-capacity rule, current quote or exit terms were verified. Confirm those in a scripted demo and contract. |
| **Zaui** | Vendor describes passenger/vehicle inventory, routes, manifests, dispatch, schedule-change notifications, reports, onboarding and 24/7 support ([ferry page](https://www.zaui.com/solutions/ferry-booking-software), C03). Useful connected-inventory comparator. | Inspected page gives no offline specification; that is a question, not proof of no capability. Price and export must be quoted. |
| **FerryCloud** | Public pages describe SaaS ferry ticketing, multichannel booking and real-time inventory; the pricing page says “Request a Quote” and identifies CET business-hour support ([product](https://www.ferrycloud.com/), [pricing](https://www.ferrycloud.com/pricing/), C04–C05). | Both pages have 2019 date markers. Current availability, support, offline policy and price are uncertain; verify before treating it as an active candidate. |
| **PouchDB + CouchDB local-first replication** | CouchDB 3.5 documents independently usable replicas and incremental bidirectional synchronization after interruptions. Conflict revisions are retained and replicas choose the same deterministic winner; the application chooses how to resolve conflicts ([consistency guide](https://docs.couchdb.org/en/stable/intro/consistency.html), [PouchDB replication](https://pouchdb.com/guides/replication.html), [PouchDB conflicts](https://pouchdb.com/guides/conflicts.html), S01–S04). Useful if long disconnected work is central. | It is eventual consistency, not reservation authority. A winner may hide a losing value in normal views; conflict handling, reconciliation screens, monitoring, backups, updates and support become product work. CouchDB issue #5879 reports a 3.5.1 upgrade problem under high shard/database count and compaction on ~8 GB nodes; the issue was open/needs-triage in the observed view, and no evidence tied a later 3.5.2 release to a fix ([issue](https://github.com/apache/couchdb/issues/5879), S07). This does not establish a small-pilot failure. |
| **Cloud Firestore offline cache** | Official docs support cached offline reads/queries and queue writes to sync later; useful managed-service comparison ([offline docs](https://firebase.google.com/docs/firestore/manage-data/enable-offline), S05). | Multiple changes to the same document use last-write-wins; cache data can be stale or incomplete; transactions fail while offline. Thus the built-in offline path cannot perform an atomic global capacity check across two disconnected terminals. Pricing, account setup, access controls and data location need procurement review. |
| **SQLite Session Extension** | Official SQLite docs describe capturing table changes into changeset/patchset blobs and applying them to a compatible database with conflict callbacks ([intro](https://www.sqlite.org/sessionintro.html), S06). A relational alternative for a team prepared to own the code. | It requires declared primary keys and compatible schema/baseline; does not capture virtual tables and is disabled by default at build time. It supplies neither transport/retry/acknowledgement nor the ferry’s conflict policy. It is a low-level mechanism, not ready-made offline synchronization. |
| **Central web app plus offline journal / paper** | A simpler authority model: queue requests as pending until central acceptance, or issue bounded per-terminal quotas. Paper can preserve records through tablet/power failure. | A local queue must not promise an unconfirmed spot. Paper needs unique numbers, a named reconciliation owner, duplicate-entry marking and protected archive. Neither option defines the operator’s reservation policy for them. |

A relevant RxDB evolution chain reinforces the test requirement without establishing general failure rates: issue #5342 reported a WebRTC peer-drop stall; the maintainer announced a reconnect fix in v15.0.0-beta.42 and linked code/tests; the reporter later described divergent/missing updates in a small three-client test; v15.0.0 release notes subsequently moved WebRTC replication out of beta. See [issue #5342](https://github.com/pubkey/rxdb/issues/5342), [fix commit](https://github.com/pubkey/rxdb/commit/28015c6097fe1e98c902cc5a8edca87c002c94c0), and [15.0.0 notes](https://rxdb.info/releases/15.0.0.html) (C07–C10). RxDB 17.0.0 docs describe a default master-wins conflict handler and a 5-second retry interval ([pinned guide](https://github.com/pubkey/rxdb/blob/17.0.0/docs-src/docs/replication.md), C07); these library defaults are not ferry booking rules.

## Plan clauses: exact disposition

| Clause | Disposition | Adjudication |
|---|---|---|
| **P1 — Provide a route-and-sailing reservation list that staff can use to review passenger and vehicle capacity before boarding.** | **Already-covered at the outcome level; clarify the implementation.** | The brief calls for vehicle reservations, walk-on passenger counts, reports and a route-first pilot. A specific list and before-boarding presentation are refinements, not literal requirements. Distinguish reserved/held, ticketed if relevant, walk-ons, actual boarded passenger/vehicle totals and remaining capacity. Dispatch must define the capacity units, particularly for oversized vehicles. Show whether local data is stale, pending or authoritative. |
| **P2 — Let staff record day-of changes and accommodation needs in a workflow that remains usable during service interruptions.** | **Already-covered, with clarification.** | Storm outages, day-of sailing changes, wheelchair assistance and oversized vehicles are explicit. Keep a local audit event with staff, terminal and time. Separate “recorded locally” from “confirmed centrally”; staff may need to use a late assistance flag even while a reservation awaits conflict resolution. |
| **P3 — Keep sensitive passenger notes out of any queue view visible to other travelers.** | **Already-covered.** | Directly reflects the brief. Create a limited public queue projection and separate staff/loading views. Do not show passenger names, contact details or explanatory notes on public screens or prints. The jurisdiction and legal classification are unspecified, so this is a product privacy requirement, not a legal compliance conclusion. |
| **P4 — Include large-text, high-contrast controls and a short handoff view for seasonal desk staff.** | **Already-covered for large text and brief training; optional enhancement for the exact control/handoff treatment.** | The brief supplies large-text tablets and seasonal workers needing brief training. High contrast and a dedicated handoff view are reasonable additions, but the brief does not set a contrast ratio or require that format. Test real screens at the tablets’ configured text size; do not imply certification. |
| **P5 — The authority for conflicting reservations entered at disconnected terminals remains an operator decision.** | **User decision.** | This is explicitly open. Choose central/pending, preallocated quotas, or independent local acceptance with an overbooking remedy. Technical evidence cannot choose customer priority or the meaning of “confirmed.” |
| **P6 — The required retention period and the exact export format for historical manifests are not yet defined.** | **User decision; portability goal already covered.** | The brief requires a way to leave later without losing reservation history. Period and exact format remain undefined. Decide which history, notes and reports must remain and who may export; verify applicable rules; require a complete readable export and test it independently. Do not invent a retention period or assume a PDF is sufficient. |

No plan clause is rejected. P1’s “already-covered” label holds only for the desired review outcome; its specific list view is added solution detail. P4’s optional classification is appropriate. No source justifies deciding P5 or P6 for the operator.

## Pilot workflow and information boundaries

Scope the pilot to one route. Use route/sailing identifiers and configuration so route two can be added without duplicating the application. Before modeling “capacity,” collect the vessel’s passenger limit, vehicle classes, oversized dimensions, deck/bay/length rules, load safety margin, and whether a vehicle reservation includes people, ticketing or payment. The brief supplies none of those facts.

The pilot should record a vehicle reservation and any necessary passenger count; walk-on counts; day-of sailing changes; staff-only wheelchair-assistance and oversized-vehicle flags; and actual boarding outcomes. Track reservations separately from tickets and actual passengers/vehicles aboard. A Washington State Ferries page gives a route-specific example where a vehicle reservation is separate from a ticket and walk-ons need no reservation ([WSF rules](https://secureapps.wsdot.wa.gov/Ferries/Reservations/Vehicle/Mobile/MobileVRSDashboard.aspx), C06); do not import that operator’s rules as I01 policy.

On public queue displays show only sailing/order status and the minimum neutral marker crew need. Keep names, contact details and personal notes in role-restricted views. Shared devices need accountable user/shift attribution. Provide a clear unsynced status and a paper manifest handoff that dispatch can reconcile once, with each paper identifier marked as imported. Reports should distinguish reserved, ticketed if in scope, cancelled/moved, no-show if used, walk-on count, actual load and unresolved offline entries. Export the records and change history with stable IDs and field definitions; test that an independent person can read them after exit.

Keep payments, public self-booking, automated messages, dynamic pricing and integrations optional until the manager confirms scope and the full cost. Ask vendors to quote set-up, annual fees, 36 staff/device use, operating-hour support, backup, hardware, training, route-two configuration and data exit separately.

## Proposed validations — none executed

1. **Two different reservations compete for one slot:** set one ordinary or oversized unit remaining, isolate terminals, and have both desks create separate reservation IDs. Reconnect. Verify the result matches the written P5 rule and no request silently disappears.
2. **Same-record conflict and retries:** edit/cancel the same reservation at both terminals, including a late assistance note. Repeat after a tablet restart and a half-shift outage. Verify both intents, authorship and times are visible, retries do not duplicate bookings, and dispatch has a recorded resolution action.
3. **Quota or pending state:** if central authority is chosen, show the local receipt and pending state and verify no one calls it confirmed before acceptance. If quotas are chosen, test exactly at and one over each allotment, including dispatcher reassignment only after reconnection.
4. **Paper recovery:** use numbered rows and a printed manifest during an outage; reconcile after sync and prove each row imports once and daily totals match.
5. **Privacy and shared access:** test staff, loading, public-display and print views with real-looking names/contact notes. Public views must omit them. Check staff attribution, shared-tablet handoff, timeout and lost-device behavior.
6. **Large-text/seasonal use:** on the actual tablets at the configured large-text setting, have a seasonal worker complete the pilot tasks after the planned short training. Record errors and task completion; this is not a formal accessibility audit.
7. **Daily report, export and route two:** reconcile a representative day to the paper manifest; export full change history and open it with ordinary tools; configure route two in a non-production demo.
8. **Budget and support:** obtain itemized initial and annual quotes against $9,000/$1,800 limits. Confirm operating-hour support, backups, hardware, staff access, data export/exit, route expansion and who owns operations.

The above are proposals only. This research did not run a product, concurrency test, large-text session, vendor demonstration, legal review, quote, export or backup/restore check.

## Open operator questions

1. Is an offline reservation a firm promise or a pending request? Is zero overbooking mandatory?
2. If firm offline confirmation is needed, will the operator accept terminal quotas and potentially unused stranded capacity?
3. What capacity dimensions and limits apply to each vessel/sailing, including oversized vehicles and passengers?
4. Does the pilot cover tickets, payments, no-shows, refunds, online sales or customer messages?
5. Which fields are necessary; what precisely may the public queue show; who sees assistance details?
6. Which jurisdiction and authority govern manifests, access, retention and boarding accessibility?
7. How long is a normal and worst outage; what devices/printers exist; what support hours are required?
8. What record history must be portable, for how long, in what usable format, and in which budget currency?

Until the operator answers the first two questions, the pilot can compare policy choices and systems but cannot truthfully guarantee globally unique confirmed reservations while the terminals are isolated.

## Execution status

- Read the assignment, its exact input map, the supplied I01 brief, the allowed own-arm predecessors and their declared source root.
- Saved independent evidence-first research before opening the predecessor draft.
- Read and adjudicated every exact P1–P6 clause; reviewed the predecessor’s complete proposed validation list and execution-status statements.
- Saved critique, final, source navigation and source map before native Goal completion.
- No vendor quote, runtime or user validation was available. Usage/billing were not observed (`null`).
