# B-01 planning draft — I01

**Purpose.** This is a complete one-route pilot planning response to the revealed plan and the I01 brief. It retains the brief’s unresolved choices rather than silently deciding them. Evidence references link to the source notes in `sources/`; the exact URLs, observed versions/commits, locators, timestamps, and operations are in [source-map.json](source-map.json).

## Pilot direction

Start by evaluating a ferry-specific reservation product such as Hogia BOOKIT against the actual route and storm scenario, with a capped proof-of-concept and written price/exit terms. The vendor describes route/capacity booking, touch-oriented quick sales, check-in, reports, and an API, but its public page does not establish small-operator affordability or disconnected-terminal behavior [S06](sources/S06-hogia-bookit.md). If it cannot meet the budget or offline requirements, compare a small local-first application against a managed cloud client with an explicit offline policy. Do not choose a database first and infer that it solves booking authority.

For any pilot, store per-sailing reservation and change events locally at both terminals so staff can record work during an interruption. Mark each write with a stable event ID, terminal, operator, event time, source/status, and the parent reservation/sailing. Use a visible `confirmed`, `provisional`, `conflict`, and `reconciled` status and a dispatcher reconciliation queue. This preserves work and audit history; it does not make every offline vehicle booking globally confirmed.

Use a single authoritative capacity decision whenever the terminals can reach it. The general manager must decide what staff may promise during a partition. Until then, the safest pilot default is local provisional booking/change capture plus the existing paper manifest. If the operator needs independent confirmed bookings while the terminals cannot communicate, allocate finite per-terminal capacity entitlements by sailing and resource class before service, then reconcile or reassign them when connected. This lowers oversell risk at the cost of using less total capacity when one terminal’s share is exhausted. The same coordination rule must apply among multiple shared tablets within one terminal: either they write through one terminal-local authority or receive non-overlapping sub-allocations. Otherwise two tablets at the same terminal can make competing claims while the inter-terminal link is healthy. Model route, sailing, vessel, and capacity profile as separate keys so a second route can be added without mixing its inventory with the pilot route. An unrestricted multi-master model or stale client cache does not satisfy the no-duplicate objective on its own [S01](sources/S01-pouchdb-conflicts.md) [S03](sources/S03-firestore-offline.md) [S04](sources/S04-firestore-transactions.md).

## Exact plan clause dispositions

### P1 — “Provide a route-and-sailing reservation list that staff can use to review passenger and vehicle capacity before boarding.”

**Disposition: Already covered, with a correction to make capacity semantics explicit.** The clause addresses the core reservation list and passenger/vehicle review. Define capacity per actual departure and encode the vessel’s controlling units: passenger places, vehicle length/space or loading class, oversized vehicle allocation, and any applicable passenger count linked to the vehicle. Do not assume passenger seats are the only limiting resource. Show whether an entry is confirmed or provisional and the time/source of the last reconciliation.

**Optional enhancement:** provide an authorized staff manifest view with count summaries, a printable/time-stamped copy, and a capacity warning before boarding. A public display should use a non-identifying queue token or vehicle marker.

**Uncertainty:** the brief supplies no vessel capacities, vehicle classes, route schedule, protected space, or rules for a vehicle change. The operator must provide these before a capacity check can be validated.

### P2 — “Let staff record day-of changes and accommodation needs in a workflow that remains usable during service interruptions.”

**Disposition: Already covered, with a correction for offline behavior and conflict handling.** The clause matches day-of changes, accessibility assistance, and outage use. Specify what counts as an interruption: internet/cloud loss, loss of the inter-terminal network, loss of power, or some combination. The local workflow should preserve every change as an auditable event rather than overwrite an entire reservation and later rely on last-write-wins. On reconnect, show the queued count, paused/active sync state, unresolved collisions, and who is responsible for each reconciliation. PouchDB provides retry/status events but leaves conflict policy to the application [S02](sources/S02-pouchdb-replication.md) [S01](sources/S01-pouchdb-conflicts.md); Firestore transactions fail offline [S04](sources/S04-firestore-transactions.md).

**Optional enhancements:** retain a paper procedure during a storm, print a dated manifest, assign local event numbers, and provide a short dispatcher reconciliation checklist. Let staff enter a late change locally while clearly distinguishing an acknowledged entry from a globally confirmed capacity change.

**Uncertainty:** wheelchair boarding assistance, equipment/staff capacity, wording on staff manifests, and whether crew must see a specific need or only an action cue have not been defined.

### P3 — “Keep sensitive passenger notes out of any queue view visible to other travelers.”

**Disposition: Already covered, with a correction that broadens the display rule.** The brief directly says passenger details must not appear on a public queue. Apply the rule to names, contact details, reservation identifiers that reveal identity, and accommodation notes, not only free-text “sensitive notes.” Use a non-identifying token on public screens. Keep assistance and oversized-vehicle instructions on an authorized loading/staff view only when needed for the operation; do not show a wheelchair label to the public. Separate the public queue from the staff manifest and minimize data copied to shared-device caches. Firestore web persistence, if selected, is off by default and persists sensitive cache data across sessions when enabled [S03](sources/S03-firestore-offline.md).

**Optional enhancement:** per-worker access or a fast lock on shared tablets, field-level minimization, and an audit log for changes to assistance instructions.

**Uncertainty:** jurisdictions and retention requirements are absent; no specific legal framework is presumed. The operator must decide what personal information is necessary for booking and boarding.

### P4 — “Include large-text, high-contrast controls and a short handoff view for seasonal desk staff.”

**Disposition: Partly already covered; high-contrast treatment and the handoff view are optional extensions.** Large text is an existing tablet setting in the brief and seasonal workers need brief training. Keep both in the pilot, and verify that forms, dialogs, totals, capacity warnings, and status labels remain usable when text is enlarged. High contrast and a one-page role-based handoff view are useful additions, but their visual details are not otherwise established by the brief.

**Optional enhancements:** add a short “start/end shift” checklist, explain provisional versus confirmed, and show how to recover from a disconnected session without technical jargon. Avoid making a training screen the only place where critical operational status is visible.

**Uncertainty:** no target text scale, contrast value, tablet model, browser, or formal accessibility standard was selected. Treat these as pilot test conditions, not as a claim of compliance.

### P5 — “The authority for conflicting reservations entered at disconnected terminals remains an operator decision.”

**Disposition: User decision; retain as unresolved.** This is already the exact choice left open in the brief. Present two viable policies: (A) central authority for confirmed vehicle reservations, with offline entries clearly provisional and later reconciled; or (B) local confirmation from preallocated capacity entitlements for each terminal and departure. Option B lets each terminal make bounded promises while disconnected but may strand capacity at one terminal. A third optimistic policy—both terminals confirm from stale local views and reconcile later—can create a booking collision and should be rejected unless the operator explicitly accepts and funds customer recovery/overbooking procedures.

Do not treat PouchDB’s deterministic conflict winner as an authority policy [S01](sources/S01-pouchdb-conflicts.md). Do not treat Firestore’s local write queue or cached availability as proof of a global capacity transaction; Firestore transactions require an online connection [S03](sources/S03-firestore-offline.md) [S04](sources/S04-firestore-transactions.md). The general manager must answer: “During a full inter-terminal outage, may staff promise a vehicle space? If yes, what maximum departure capacity can each terminal independently confirm?” Until answered, use provisional wording in the pilot.

### P6 — “The required retention period and the exact export format for historical manifests are not yet defined.”

**Disposition: User decision; retain the open parameters and add an exit capability.** The brief requires a way to leave without losing reservation history; the plan correctly leaves duration and exact serialization unresolved. The operator must select retention duration based on its record obligations and business needs; this research cannot choose it without jurisdiction or policy.

**Optional recommendation:** make each daily manifest available as readable CSV/PDF for staff, and provide a separate full-fidelity JSON or documented CSV export with stable IDs, event history, data dictionary, and any linked attachments for migration. Preserve an export at regular intervals and test that it opens without the selected product. Require the vendor to include export access and deletion/return terms in the pilot contract. A convenient report is not a substitute for a complete history export.

**Uncertainty:** no formats, volume, attachments, retention period, legal hold, backup cadence, or import/restore target are specified. Firestore free quotas and paid usage units are not a substitute for a total-cost/retention plan [S05](sources/S05-firestore-pricing.md).

## Retained findings, alternatives, and rejected claims

1. **Commercial ferry product first.** BOOKIT is a relevant procurement lead because its public feature claims cover route/capacity, booking, check-in, quick sales, reports, and APIs. Its public page does not establish offline operation, contract price, current deployment support, or low-IT burden. Obtain a tailored quote and a live storm/outage demo; do not infer these capabilities from the marketing page [S06](sources/S06-hogia-bookit.md).
2. **Managed cloud client alternative.** Firestore could reduce server maintenance and automatically sync local changes, but offline cached queries may be incomplete; web persistence needs explicit configuration and shared-device data handling; and capacity transactions cannot complete offline [S03](sources/S03-firestore-offline.md) [S04](sources/S04-firestore-transactions.md). Keep it only if the pilot accepts provisional entries or implements approved local entitlements. Cost depends on region and usage units and must be modeled against the stated budget [S05](sources/S05-firestore-pricing.md).
3. **Local-first replication alternative.** PouchDB/CouchDB supports local databases and retrying sync, but creates engineering/operating responsibilities and application-managed conflict resolution. It is appropriate for technical evaluation, not an automatic recommendation for an operator with no dedicated IT [S01](sources/S01-pouchdb-conflicts.md) [S02](sources/S02-pouchdb-replication.md).
4. **Capacity entitlements.** A quota per terminal is a different admission-control policy from syncing records. It can bound independent acceptance if units, limits, and quotas are correct; its cost is reduced flexibility/utilization and extra dispatch work. This is a proposed design principle, not an implemented product feature.
5. **Paper fallback.** Keep a controlled paper manifest for outages lasting a half shift. Assign a local sequence and reconcile each change once. This preserves the current human fallback but should not become an untracked second source of truth.

**Rejected:** (a) accepting unrestricted confirmed reservations offline at both terminals and assuming post-outage synchronization prevents duplicate promises; (b) using last-write-wins for capacity counts or important passenger changes; (c) treating an empty offline query as proof there are no bookings; (d) claiming a particular vendor or backend fits the $9,000/$1,800 ceilings without quote/workload evidence; (e) claiming that the PouchDB issue proves current releases are defective. The sources support none of these conclusions.

## Discriminating validation proposals

No runtime, codebase, device fleet, route capacity data, or vendor test environment was supplied. None of the following application validations has been executed. They are acceptance tests to run during procurement or implementation.

| ID | Scenario | Pass condition that distinguishes a safe design |
|---|---|---|
| V1 | Disconnect the two terminal networks for the dispatcher’s reported half-shift. At each end, use two shared tablets to claim the same last vehicle slot, change a vehicle size, add/cancel a walk-on count, and update assistance. | The UI never represents two uncoordinated claims as mutually confirmed. Under provisional policy both remain attributable provisional records; under quota policy each reservation consumes an auditable entitlement and a quota-exhausted terminal refuses or routes to a manager. No event is silently lost on reconnect. |
| V2 | Reconnect in both terminal orders after creating and editing separate records plus a collision against one existing reservation. Repeat after app restart and a second browser tab if using browser-local PouchDB. | All events appear once with terminal/operator/time, sync resumes, conflicts are visible, and the approved business resolution is explicit. This also exercises the kind of cross-window change-notification regression recorded in the PouchDB issue chain [S07](sources/S07-pouchdb-issue-8581.md) [S08](sources/S08-pouchdb-release-8.0.1.md). |
| V3 | Run a full load using the actual vessel’s passenger and vehicle limits, including oversized vehicles, linked passenger counts, and the real reservation mix. | No accepted combination exceeds any authoritative resource limit; units and conversion rules are visible and reproducible. |
| V4 | During a sailing cancellation, vessel swap, or time change, isolate one terminal and dispatch. | Staff can identify the authority for the change, distinguish stale versus current instructions, record who was notified, and reconcile all affected bookings without duplicating or losing them. |
| V5 | Use the public queue display and staff manifest with test records for passenger name/contact, accessibility assistance, and oversize vehicle. | Public display contains no identifying passenger information or accommodation detail; only the authorized loading view exposes the minimum operational cue needed. Shared-tablet session changes do not expose the preceding worker’s passenger cache. |
| V6 | Use the complete booking, change, check-in, and manifest flow with enlarged OS text and high contrast on the actual shared tablets; give a seasonal worker only the proposed handoff guide. | Staff can complete the high-frequency tasks without clipped controls or hidden status, and can correctly explain confirmed/provisional state and outage reconciliation. |
| V7 | Export a pilot day including changes, cancellations, reports, and attachments; open it outside the product and restore a copy. | Export has stable references and a data dictionary, preserves history without loss, and can be read/restored without vendor access. Retention and deletion behavior match the operator’s selected policy. |
| V8 | Model actual annual reads/writes/deletes, stored data, outbound transfer, backups, support, devices, implementation, and training; obtain a vendor quote. | Initial total stays within $9,000 and recurring total within $1,800/year, with region, taxes, renewal terms, support limits, and volume assumptions stated. |

## Executed work versus proposed work

**Executed:** read the named assignment, input map, and declared I01 brief; searched and inspected public primary product documentation; recorded source URLs, observed version/commit status, locators, access completion timestamp, and operations in the source map; saved discovery; ran the prescribed reveal-plan command; read the revealed plan.

**Not executed:** no ferry app/runtime, sync implementation, shared tablet, simulator, test database, product trial, capacity dataset, vendor demo, privacy/security review, accessibility audit, cost model, or export/restore test was available. V1–V8 are proposals, not results.

## Obligation coverage

- **O1:** discovered a ferry-specific product, a managed cloud cache, local-first replication, capacity entitlements, and a controlled paper fallback.
- **O2:** recorded conflict/winner behavior, retry/status behavior, web persistence defaults, offline query constraints, transaction behavior/limits, and pricing units with applicability in S01–S06.
- **O3:** retained the PouchDB refactor → issue/reproduction → fix/tests → 8.0.1 release chain and scoped its relevance in S07–S08.
- **O4:** dispositions are recorded above for every exact P1–P6 clause.
- **O5:** retained operating constraints, alternatives, conditions, user decisions, rejected claims, and uncertainty in this self-contained draft.
- **O6:** V1–V8 are discriminating proposed validations; the executed-work section states what did and did not run.
