# Independent critique — I01 / B-01 treatment

## Scope and method

I read the exact I01 brief and independently consulted public primary documentation before opening the treatment predecessor. I saved [evidence-first.md](evidence-first.md) first. I then read the declared own-arm predecessors (discovery.md, draft.md, revealed-plan.md, source-map.json) and the declared research source root (sources/index.md and sources/evidence.md). I independently reopened the primary vendor pages and the key technical/release sources needed to check the draft’s material claims. This review does not use another arm, evaluator, campaign history or private provider information.

No product, runtime, vendor demonstration, booking collision, accessibility, quote, export, legal or recovery check was executed. The proposed checks remain proposals. Source identities and access details are in [source-map.json](source-map.json); bounded evidence and navigation are in [sources/index.md](sources/index.md) and [sources/critic-evidence.md](sources/critic-evidence.md).

## Overall assessment

The predecessor draft is a careful, usable conditional plan. Its central distinction is sound: an offline-capable device can record local work, but two isolated terminals cannot globally arbitrate the same last capacity unit without an authority, preallocated non-overlapping inventory, or an explicit conflict/overbooking policy. The product pages are presented as vendor claims and leads rather than proof; the paper path, budget arithmetic, unanswered operating facts, and unexecuted validation status are preserved. I found no material false correction, unsupported product guarantee, or plan clause that should be rejected.

One material completeness improvement belongs in the final synthesis: the technical comparison in the draft spends most of its space on custom local-first replication. Add bounded comparisons with a managed local-cache database (Firestore) and a lower-level relational changeset mechanism (SQLite Session Extension). Firestore does queue offline writes but uses last-write-wins for multiple writes to one document and fails transactions offline; SQLite captures/apply changesets but requires application-built delivery, replay, schema and business conflict handling. These options broaden the trade space but do not change the draft’s procurement-first recommendation. This is an additive finding, not a correction to the draft’s recommended vendor qualification.

## Material findings

### M1 — Global capacity collision is distinct from a same-record replication conflict

**Draft treatment:** Correctly identifies both the terminal collision and the product-authority question, and explicitly notes in retained findings that two different reservation IDs for one remaining unit may produce no document-level conflict. Its proposed split-inventory demo is discriminating.

**Adjudication:** Retain. Make the distinction prominent in the final and test two different reservation records as well as simultaneous edits to the same reservation. CouchDB’s deterministic winning revision is a storage convergence rule; it does not allocate ferry deck capacity or choose which customer receives a spot. Firestore’s local write queue and last-write-wins merge also do not provide an offline transaction that atomically checks shared capacity. A zero-overbook promise therefore requires central confirmation while offline entries remain pending, or previously partitioned capacity that sums to no more than the actual load limit. If unrestricted local confirmation is selected, over-capacity/priority handling is a conscious policy, not a defect that can be hidden by sync.

### M2 — P2 must distinguish recording an offline fact from confirming a scarce reservation

**Draft treatment:** It asks for explicit confirmed/provisional/pending/conflict states under P5 and a late-note audit trail. This correctly resolves the apparent tension between “continue working” and unresolved reservation authority.

**Adjudication:** Retain and strengthen in final. During an outage, an operator may still record a late wheelchair-assistance note or sailing change locally; that fact should be visible to authorized crew even if the associated reservation remains pending. The state label and public projection must be defined separately. The brief does not decide which class of action can be committed locally.

### M3 — Technical alternative coverage

**Draft treatment:** Good practical coverage of vendor products, paper/quota designs, CouchDB and RxDB. Its custom synchronization discussion is appropriately cautious and includes a relevant issue/fix/release chain. It does not compare managed offline-cache or embedded-relational-change options.

**Adjudication:** Add Firestore and SQLite as bounded alternatives in the final, using official documentation. The Firestore guide explicitly states cached offline reads/queries and queued writes, last-write-wins for multiple changes to one document, potentially stale/incomplete cache results, and no offline transactions. SQLite Session captures changesets for same-schema databases and offers conflict callbacks, but is disabled by default, requires primary keys and does not provide the application’s cross-terminal synchronization service. Neither solves the business choice. Keep them secondary alternatives and do not imply procurement fitness without pricing, privacy, and operations checks.

### M4 — Issue/fix/release chain is scoped correctly

**Draft treatment:** RxDB issue #5342 is used as a caution about peer reconnection, not as a ferry failure rate. It reports one three-client test with divergent/missing updates after a reconnect fix; the linked commit modifies reconnect code and tests; later v15 notes move WebRTC out of beta.

**Adjudication:** Accurate with one wording guard: the issue’s maintainer released v15.0.0-beta.42 with a reconnect fix; the later report still describes a small test’s state divergence, and the final issue/release chronology does not establish the present reliability of RxDB or a production support commitment. The final retains this chain only as evolution evidence. Separately, CouchDB issue #5879 is open/needs-triage and reports a 3.5.1 upgrade problem under high shard/database count and compaction on roughly 8 GB nodes; a later 3.5.2 release exists, but I found no evidence in the accessed pages that it fixes #5879. These are bounded cautions, not reasons to claim either product is unusable at pilot scale.

### M5 — Proposal coverage is appropriate but must remain unexecuted

The draft offers good discriminating validation: isolated-terminal capacity collision, quotas, reconnect/retry, paper reconciliation, private/public projections, shared tablets at large text, report/export, route two, and itemized costs. Those are proposed. Its executed section reports no runtime/vendor witness. Retain that distinction; do not convert design checks into results.

## Exact plan-clause adjudication

| Plan | Draft disposition | Critic finding |
|---|---|---|
| **P1** Route-and-sailing reservation list for staff to review passenger and vehicle capacity before boarding. | Already-covered, with clarification. | **Agree at outcome level; minor taxonomy nuance.** The brief asks for vehicle reservations, walk-on counts, reports and a one-route pilot, so the underlying review need is implied. A specific route/sailing list and its before-boarding presentation are implementation refinements, not literal brief language. Keep the disposition but state that reservations, capacity holds and actual boarded counts are separate, and that the operator’s loading units define capacity. The list must show freshness/authority when offline. |
| **P2** Record day-of changes and accommodation needs through interruptions. | Already-covered, with necessary clarification. | **Agree.** The brief explicitly calls for day-of sailing changes, accessibility/oversize flags and storm connectivity. Add a distinct local-recorded vs confirmed state; a staff-only late note can be captured during an outage without making a booking globally authoritative. |
| **P3** Keep sensitive notes off a public queue. | Already-covered. | **Agree.** This directly reflects the brief. The staff view, public queue and print view should be separate data projections; no name/contact/explanatory passenger note in public. The brief and sources do not identify a jurisdiction or legal category, so avoid making a compliance claim. |
| **P4** Large text, high contrast, short seasonal handoff view. | Already-covered for large text/training; high contrast and dedicated handoff view optional. | **Agree.** Large text and brief seasonal training are in the brief. “High contrast” and the exact handoff-view format are useful choices but not explicit requirements. Test actual tablets at actual system text size; do not claim formal accessibility certification. |
| **P5** Conflicting disconnected-terminal authority remains an operator decision. | User decision. | **Agree.** This is explicitly unresolved in the brief. The technical and vendor evidence cannot adjudicate customer priority. Keep three policy choices visible: central authority with pending entries, non-overlapping local quotas, or local acceptance with an explicit overbooking remedy. |
| **P6** Retention duration and exact export format not defined. | User decision, portability goal already covered. | **Agree.** “Leave later without losing reservation history” is a stated product goal; duration and accepted representation remain open. Require a full usable export and restore/readability demonstration, then have the operator choose the time period and format after checking applicable record duties. Do not invent a legal period. |

The draft rejects no plan clause, and no rejection needs to be reversed. P1’s “already-covered” label is acceptable only at the goal level; the concrete list view and capacity-review wording remain added product detail. No source-backed evidence justifies choosing a final P5 or P6 value on the operator’s behalf.

## Minor findings and uncertainty

- The draft’s $1,800 / 12 = $150 monthly ceiling and $1,800 / 36 = $50 per staff-year conditional arithmetic are correct. Seat models and total cost are unknown; do not make the division sound like a vendor price.
- Vendor feature statements are marketing claims. Compass’s page claims offline port ticketing; AOV claims authorized local operations and later sync; neither page specifies simultaneous disconnected capacity allocation. Zaui’s page claims real-time passenger/vehicle inventory and manifests but does not describe offline behavior. FerryCloud’s pricing page is dated 2019 and quote-only. The draft handles these limits correctly.
- Washington State Ferries is a process example only: its named-route reservation is separate from a ticket and walk-ons do not need reservations on those routes. It is not a rule to import to I01.
- “Oversized vehicle” capacity should not be modeled as a generic vehicle count until dispatch supplies the loading unit. The brief omits vessel, route, dimensions, capacity, jurisdiction, outage frequency, device models, currency, and current ledger fields. Those omissions remain open facts, not evidence that the plan is invalid.
- Do not state that PWA/browser storage is durable indefinitely, that Firestore cache contains all needed data, that SQLite changesets provide sync, or that product export/privacy/hosting/cost is proven.

## Changes to carry into the final

1. Keep the draft’s conditional procurement-first recommendation and its six plan dispositions.
2. Preserve all ferry-specific supplier candidates, the numbered-paper alternative, and the central/pending, quota, and local-confirmation policy alternatives.
3. Add Firestore and SQLite as limited technical comparisons, and state their exact offline limitations.
4. Distinguish two different reservations competing for one slot from concurrent changes to the same reservation record.
5. Separate local capture, dispatch authority, customer-facing confirmation, crew assistance visibility and public queue projection.
6. Keep all demonstrations, checks, prices, legal conclusions, usability results and vendor claims clearly labeled; no such verification was executed here.
