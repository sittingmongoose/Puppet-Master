# I01 independent discovery

**Stage:** ER11 B-01 / treatment / research  
**Prepared:** 2026-10-09, before plan reveal  
**Evidence status:** Public primary-source research is recorded in [the source index and relation graph](sources/index.md) and [source-map.json](source-map.json). No product runtime, offline behavior, capacity transaction, accessibility, export, or price validation was executed.

## Decision frame

This is a small operational system for two ferry terminals and a dispatch office, with 36 staff, shared tablets, a poor-link day-of workflow, and no dedicated IT employee. The operator has given an initial ceiling of $9,000 and a recurring ceiling of $1,800 per year, wants a one-route pilot, and needs a second-route path if the pilot works.

The core issue is not whether a screen can continue to open with no connection. Two disconnected terminals cannot observe each other’s current sales. If each terminal can independently confirm the final remaining capacity on a sailing, the product needs either preallocated capacity, a process that delays confirmation, or a policy that tolerates conflict and resolves it. A database that stores local edits is necessary for offline work but is not sufficient to prove that global no-overbooking will hold.

I would qualify ferry-specific vendor systems before commissioning custom sync software. Compass and Access One Voyage both make explicit offline-operation claims; Zaui advertises a more centralized, connected reservation and manifest workflow; FerryCloud is another SaaS lead with a dated public page and quote-only pricing. None of the pages inspected establishes the precise behavior this brief needs: whether two physically isolated terminals may confirm overlapping capacity, how late updates are handled, what the public queue can show, what a complete export contains, and whether all current and ongoing costs fit. A manual numbered manifest and an explicit capacity policy should remain part of the pilot plan even if a vendor product is selected.

This is a conditional procurement direction, not a vendor selection. If the manager prefers one authority, the system should collect offline booking intents and mark them provisional or waiting until the dispatcher can reconcile them. If the manager wants each terminal to issue confirmed reservations while fully disconnected, preallocated per-sailing quotas are the simplest candidate policy to test. Allowing unrestricted local confirmations is a third policy, but it explicitly accepts a chance of oversell and needs a customer-priority remedy. These policies cannot be collapsed into a technical default without the operator choosing what “confirmed” means.

## Independent candidate landscape

### Ferry operations products

| Candidate | Why it is useful here | What the inspected public source does not establish |
|---|---|---|
| **PDMS Compass** | Its vendor page specifically describes remote and inter-island ferry operations, route/vessel/fare/ticket configuration, multiple booking channels, a central system, printed tickets and offline port ticketing. It is the strongest offline-ferry demonstration lead found. [Official Compass page](https://www.pdms.com/platforms/compass/) ([S01](sources/evidence.md#s01--pdms-compass)). | The offline claim is about port ticketing. It does not state whether remote terminals get partitioned inventory, can authoritatively reserve simultaneously, queue uncertain bookings, or reconcile the same last vehicle space. No price or public queue privacy details were observed. |
| **Access One Voyage (Cyrabyte)** | The vendor describes a ferry system for ticketing, passenger processing, boarding, reporting and offline work, including local authorized operations that sync later; it names Windows for terminal work and Android for mobile workflows. It also claims operator control of data and role/audit options. [Official AOV page](https://accessonevoyage.cyrabyte.com/) ([S02](sources/evidence.md#s02--access-one-voyage)). | “Supported applications” and “authorized operations” are not itemized. The page does not say how conflicting capacity is allocated, whether both terminals can confirm during a full network split, what the print/export format is, or how a shared tablet user’s permission is represented. Product maturity, price, service coverage and contract terms require direct qualification. |
| **Zaui** | The ferry page describes separate passenger, vehicle and cabin inventory; multi-route scheduling; manifests; check-in; dispatch; change notifications; custom reports; onboarding; and 24/7 support. That offers a useful counterpoint to a locally operated system: one connected inventory with staffed onboarding. [Official Zaui page](https://www.zaui.com/solutions/ferry-booking-software) ([S03](sources/evidence.md#s03--zaui)). | Its inspected page is not an offline spec. It does not establish disconnected operation, local transaction authority, offline manifests, queue-display redaction, current quote or export terms. Ask whether its real-time model can meet the terminal outage rule rather than inferring either support or lack of support. |
| **FerryCloud** | Its page describes ferry SaaS, single/return and multichannel booking, and real-time inventory. The pricing page lists a basic feature set and request-a-quote flow. This is a possible small-operator product lead. [Product page](https://www.ferrycloud.com/) and [pricing page](https://www.ferrycloud.com/pricing/) ([S04–S05](sources/evidence.md#s04--ferrycloud-product-page)). | The pages include July 2019 date markers, do not show an amount, and do not describe offline work or a conflict policy. Treat them as a prompt to confirm the vendor and current product, not current evidence of availability or budget fit. The pricing page says Basic support is during CET business hours; verify whether that is acceptable for local sailing hours. |

The pages above are supplier claims. The most useful procurement comparison is a prepared demonstration with one actual sailing, the operator’s vehicle and passenger rules, and a deliberate terminal split. Request an all-in quote that separately identifies setup, annual license, staff/device counts, support, hosting, printer/scanner hardware and consumables, connectivity, payment costs if any, training, integration, backup, export/retention, and the incremental cost of adding a second route. No comparable amount was published in the sources reviewed, so pricing is unknown rather than assumed to be over or under budget.

### Reference workflow: hold, ticket, and boarded count

Washington State Ferries provides a concrete public example of keeping these states separate: its page says a vehicle reservation saves a spot but does not count as a ticket; on its named routes it does not require walk-on passenger reservations; it also describes route-specific one-way, standby, no-show and disruption policies. [WSF reservation rules](https://secureapps.wsdot.wa.gov/Ferries/Reservations/Vehicle/Mobile/MobileVRSDashboard.aspx) ([S06](sources/evidence.md#s06--washington-state-ferries-reservation-workflow)).

This does not establish what I01 should do. It is a useful prompt to decide whether the first pilot handles only space reservations and counts, or also tickets, payments, fare rules, no-shows and customer notifications. A daily report should not conflate reservations with passengers and vehicles actually aboard. The pilot should separately report reserved/held, ticketed if applicable, cancelled/moved, no-show if applicable, walk-on count and boarded count.

## Three materially different disconnected-operation designs

### 1. One authoritative inventory; offline entries are not yet confirmed

A central dispatcher or connected service is the single place that can promise the final capacity. During a link outage, each terminal can collect requests with a local receipt number and show a visible pending or provisional state. The dispatcher accepts/rejects them when the operation can reconcile the sources. Staff can still count walk-ons, record day-of changes and use a printed manifest, but they must not describe a local provisional entry as a guaranteed spot.

**Advantages:** there is a clear owner of the scarce inventory; booking rules and reports have a simpler source of truth; it avoids giving both isolated terminals authority to consume the same unobserved slot.

**Costs and conditions:** callers may wait for confirmation; the dispatcher needs a reliable contact/merge process; customer-facing wording must define a provisional booking; the station may still need a local cap before taking more requests. If local connectivity is absent for half a shift, the queue can grow. This is a product and service policy decision, not a database setting.

### 2. Preallocated per-terminal quotas

Before a sailing or shift, divide the sellable capacity into non-overlapping terminal allotments. A disconnected terminal may confirm reservations up to its allotment. Dispatcher can reassign unused capacity only after communication resumes. Quotas may be separate by capacity dimension: ordinary vehicle spaces, oversized spaces, and passenger/walk-on headroom if the operator’s actual loading rule requires those limits.

**Advantages:** each terminal can make a definite local decision inside its own budget; no global coordination is needed during a split to preserve the planned total allocation.

**Costs and conditions:** a terminal can turn someone away while another allotment is unused; changes to vehicle class/size can invalidate a simplistic quota; dispatch must approve and record reallocations; the team needs a safe response when a customer requests more than the remaining local allotment. Quotas should be a conservative pilot choice until actual demand and load variation are measured.

### 3. Independent local acceptance followed by reconciliation

Each terminal accepts requests using its last known capacity view. After reconnection, it syncs the edits and dispatch resolves duplicates, over-capacity sailings, late cancellations and conflicting accommodation changes. This provides high local availability, but a duplicate confirmation or capacity overrun is a possible result, so customer handling and safety procedures must say who has priority and who contacts affected customers.

**Advantages:** staff can keep recording what customers ask for even if they cannot reach dispatch; network service is not a precondition for taking an order.

**Costs and conditions:** local-first does not make independent confirmations globally unique. The implementation must preserve all intent records and report conflicts; otherwise a storage-layer winner can obscure an edit. If the manager will not tolerate any confirmed overbooking, unrestricted local acceptance is the wrong policy. It could be used only for provisional requests or non-capacity facts like a local walk-on count.

### Paper continuity or hybrid

A numbered paper manifest can survive power/tablet/network failure and is a materially different approach from vendor software or a custom sync engine. A hybrid pilot can use software when it is connected and a printed numbered paper log during the outage. Each paper row should record only what dispatch needs, with a separate private page or controlled notes for customer contact/access assistance if required. At restoration, one named person enters or reconciles each row and marks its paper ID to prevent duplicate re-entry.

If the operator wants both terminals to keep confirming reservations while unable to communicate, paper alone still needs a capacity policy. Pre-printed quotas or vehicle-class blocks give independent authority; a shared queue with unconfirmed requests does not. The paper workflow also needs a protected archive and a defined time to transcribe it so that the history remains searchable.

## Technical behavior that matters if a custom implementation is considered

Apache CouchDB 3.5 describes independent databases that work offline and periodically synchronize changes. If two replicas change the same document, it flags conflict revisions and deterministically picks a winner; both versions remain available, but the application has to decide what to do. Normal CouchDB views use the winning revision, while an application can explicitly query for conflicts. [CouchDB consistency guide](https://docs.couchdb.org/en/stable/intro/consistency.html) and [conflict guide](https://docs.couchdb.org/en/stable/replication/conflicts.html) ([S07–S08](sources/evidence.md#s07--apache-couchdb-eventual-consistency)).

The inference for a ferry is important: resolving a conflict on one shared reservation document does not necessarily catch a capacity overrun created by two separate reservation documents. Both terminals can create different reservation IDs for the last slot, with no same-document collision to flag. If they instead decrement the same sailing-capacity document, the document conflict still needs a domain rule and does not tell staff whether to honor the buyer at terminal A or terminal B. A deterministic winner is reproducible, not necessarily fair or safe.

RxDB version 17.0.0 documents local reads/writes offline, checkpointed pull/push handlers, and synchronization after reconnect. The developer supplies backend pull and push behavior; the backend’s pull response needs an ordered checkpoint, and deletes are represented so their state can replicate. The documented general defaults include live replication, automatic start, a 5,000 millisecond retry time, and one tab acting as leader in a multi-instance configuration. Its default conflict handler takes the master/server version over the fork/client version; the developer can replace that handler. The docs also warn that failed pushes may be sent again, so a backend may need unique write IDs or duplicate-safe handling. [Pinned v17.0.0 replication guide](https://github.com/pubkey/rxdb/blob/17.0.0/docs-src/docs/replication.md) ([S09](sources/evidence.md#s09--rxdb-local-first-replication-guide-version-1700)).

These defaults are meaningful for implementation but dangerous as an unreviewed ferry product policy. A locally entered reservation could meet a conflicting master state after reconnect; a master-wins default may drop the local fork. If the app turns each attempted booking into an append-only intent, that avoids silently erasing the request but still does not grant unique sailing capacity. The product needs a distinct result such as confirmed, pending, provisional, rejected, or conflict, and an operator-visible reconciliation queue. Capacity availability should be calculated according to a chosen authority/quota policy, not only merged from replicated document states.

A public RxDB issue illustrates that lower-level connectivity behavior has evolved. In issue #5342 a user reported WebRTC replication stalling when a peer had disappeared. Commit 28015c6097fe1e98c902cc5a8edca87c002c94c0, merged through PR #5348, changed reconnect code and tests. The maintainer said v15.0.0-beta.42 included a reconnect fix, after which the same reporter described remaining missing/divergent updates in a small three-client test and the maintainer described WebRTC as beta. The later 15.0.0 release notes say WebRTC replication moved out of beta. [Issue #5342](https://github.com/pubkey/rxdb/issues/5342), [fix commit](https://github.com/pubkey/rxdb/commit/28015c6097fe1e98c902cc5a8edca87c002c94c0), [PR #5348](https://github.com/pubkey/rxdb/pull/5348), and [15.0.0 release notes](https://rxdb.info/releases/15.0.0.html) ([S10–S12](sources/evidence.md#s10--rxdb-issue-5342)). This is one project issue and one small workload, not a measured failure rate. It is still enough to reject “we can just turn on peer sync” as an untested assurance for a no-IT operator.

A custom local-first implementation is therefore an architecture candidate rather than a cost-free offline feature. The operator would need an owner for sync, conflict visibility, device recovery, updates, backups, training and future support. The initial budget may not cover that continuing work even if the database itself is open source. No software build or technology witness is available in this assignment; the proposal remains unexecuted.

## Pilot scope and information model

Keep the first pilot to one route, while using stable route/sailing identifiers and configuration so that a second route can be added without duplicating the application. Start by deciding the sailing’s actual physical capacity rules, then represent those rules in the reservation form. The brief does not state route length, vessel class, schedule volume, vehicle dimensions, passenger limits or whether vehicles reserve fixed bays. Do not assume “one vehicle = one capacity unit” until dispatch confirms it.

A small pilot workflow should cover:

1. Create/select a route sailing and record the load limits used by dispatch.
2. Record a vehicle reservation, the number of people traveling with it if needed, and any confirmed oversized category.
3. Record walk-on passenger counts without forcing unnecessary customer identity data.
4. Record wheelchair-access boarding assistance as a staff-only operational flag, with only a neutral flag or aggregate count on any visible public queue.
5. Record sailing changes, cancellation/move decisions, tickets if in scope, actual boarded counts, and who made each change.
6. Produce a daily dispatch report that distinguishes bookings, walk-ons, tickets if applicable, cancellations, no-shows if applicable, actual passengers/vehicles aboard, remaining/overridden capacity and unresolved offline entries.
7. Export a complete, readable copy of reservations, status/change history, route/sailing data and report inputs. Let the manager inspect the export before launch and verify it remains usable if the contract ends.

Use role separation suited to desk staff, loading staff and dispatch. A loading view can show sailing, vehicle class, and a neutral assistance marker without showing passenger names/contact details. Shared tablets need individual staff identity or an approved shift handoff that preserves accountability; ask how a vendor handles shared-device logins, session timeout, lost devices, and cached passenger information. If staff tablets use larger system text, test the actual forms and reports at the configured size instead of relying on a marketing “accessible” claim.

Keep payments, public online sales, fare optimization, customer communication automation and complex multi-route booking optional until the manager confirms they are necessary and the budget includes them. Each can add credentials, fees, support and outage behavior. The WSF workflow demonstrates that a reservation process need not be the same thing as ticket purchase, but local rules and customer expectations decide whether that split suits I01.

## Qualification and validation proposals

All items below are proposed. No listed check was run.

### Vendor demonstration: split inventory

Use one real pilot sailing and set exactly one ordinary vehicle space and one oversized capacity slot remaining. Take both terminals offline from each other while leaving local devices powered. Have a desk worker at each terminal attempt a vehicle reservation against the same remaining unit. Repeat after swapping arrival order and include one oversized vehicle, a passenger count, and a walk-on count. Observe:

- Which status the customer sees at each step: confirmed, provisional, waiting, rejected, or other.
- Whether an offline action decreases local capacity and which capacity dimension it decrements.
- Whether the vendor supports non-overlapping terminal quotas and how unused allotments are reassigned.
- Whether a reconnect yields both records, an explicit conflict and a chosen resolution, or any silent loss.
- Whether dispatch can tell which terminal/staff member entered each change and can correct the result without erasing history.

Set acceptance criteria before the demo. If the manager requires zero confirmed over-capacity results, a test where both isolated terminals confirm the same final unit fails unless a preallocation policy makes the second confirmation invalid. If the manager accepts provisional bookings, verify the software labels and customer message remain unambiguous.

### Late change, paper handoff and recovery

During a measured half-shift-length disconnection, amend a reservation with an accessibility assistance flag, change a sailing time, and cancel or move another reservation at one terminal while dispatch uses a printed manifest. At reconnection, reconcile the device and paper copy. Verify no old version silently replaces a newer change, assistance remains visible only to authorized staff, and each paper entry is marked as imported exactly once. Repeat after a tablet restart and with the dispatcher’s device absent during the sync.

### Queue display, large text and seasonal onboarding

Use the operator’s shared tablets with the same large-text setting staff already use. Ask a seasonal desk worker, after the actual short training session, to find a sailing, reserve an oversized vehicle, record walk-ons, and locate the late assistance note. Inspect the screen or printout used in the public queue: it must not disclose passenger names or contact details. Test whether focus order, button size, line wrapping, status colors plus text, and touch targets still work with large type. This is a proposed usability check, not a formal accessibility certification.

### Reports, exit and total cost

Reconcile a day’s report against paper tickets/counts: held/reserved vehicle capacity; walk-ons; tickets if used; boarded vehicles and passengers; changes; cancellations; no-shows if applicable; and unresolved pending/conflict items. Have someone other than the installer export the entire history and read it using ordinary tools. Confirm identifiers and a row-by-row change history survive, then test adding a second route in a non-production demo.

Ask for one written quote with every initial and recurring charge. Compare total initial spend to $9,000 and annual recurring spend to $1,800. State how 36 staff access the system; do not assume all 36 require individual paid seats or that they can safely share one login. Include the cost of support during actual operating hours, backups, hardware, replacements, training, payments if used, future route setup and exit/export services. A product passes budget review only on the quote, not because the license fee alone appears low.

## Unresolved operator choices and facts to collect

1. Which terminal or person owns a reservation when the terminals cannot reach one another? Is an offline reservation ever a firm promise, or can it be provisional until synchronized?
2. What are the per-sailing limits for passengers, ordinary vehicles, oversized vehicles, and any special vehicle classes? Does capacity depend on deck length, weight, lanes, vehicle dimensions, or passenger/crew limits?
3. Are reservations separate from tickets and payment? Does the pilot include walk-up cash/card sales, online customer booking, no-show rules or refunds?
4. What is the exact meaning of the public queue display? Which markers may be public, and who may see assistance details and contact information?
5. What manifests, reports, retention periods, accessibility rules and data-processing duties apply in the operator’s jurisdiction? The brief does not specify a country or regulator, so legal requirements cannot be determined here.
6. How long is a typical and worst storm outage, how are the terminals physically connected when cellular service works, and what local devices/printers are already available?
7. What currency does the budget use, which hardware and one-time costs are inside the cap, and what customer support hours are required?
8. What constitutes a useful daily report, and which existing ledger fields or history must be retained/exported?

Collect the current sheets and two representative sailing-day manifests only through a separately authorized source; none were supplied here. Capture demand, oversize share, late-note frequency, walk-on count, duplicate booking frequency, reconciliation time and the longest disconnected interval before setting a quota or a software acceptance threshold. Do not copy passenger details into a public display or an evaluation artifact.

## Discovery status

This document is the substantive discovery produced before plan comparison. It retains product candidates, operating alternatives, source-backed conditions, counterevidence, unknowns and proposed validations. The above validations were not executed. The per-clause disposition will be written in draft.md only after the assigned reveal script freezes this discovery and exposes the case plan.
