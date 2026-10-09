# Independent discovery — ER11 B-03 / I03

**Stage:** control research, M05 retained-investigator.  
**Frozen before plan reveal:** 2026-10-09. Read the exact I03 brief and exact input map; it declares no predecessors and no source roots. The case-plan file has not been opened. Exact P-clause comparison remains pending.

## Problem framing

The nursery needs a reliable relationship among plant family/variety, propagation batch, physical location, expected readiness, and customer allocation. Twenty seasonal workers need phone use in two weak-signal structures; three coordinators maintain records outside the peak. Existing bench tags and the shared calendar stay in use this season. Color-only and English-only interfaces exclude named staff. Customer names and delivery addresses belong only with fulfillment staff. The $5,500 startup ceiling is ambiguous about recurring fees, devices and setup. Two plant families are the pilot boundary; a wholesale view is only a later possibility.

A nursery is not just a stockroom. Germination and yield vary, so an expected readiness window must not become a firm commitment by implication. A tray can move while its order relationship remains; a split, loss or short count must not erase lineage. Several phones can act on old information while disconnected. No offline design can give multiple disconnected devices exclusive rights to the same shared quantity without a separate coordination rule. An unsent movement/count is local evidence, not an accepted central stock update.

## Independent alternatives

### Horticulture-specific software

- **Growflo Mobile Inventory** markets nursery-floor scanning, stock movements, availability updates, offline work that syncs on reconnection, and ERP integration. The page does not explain conflict resolution, what a disconnected worker can promise, supported devices, access to customer data, or price. It merits a demo; marketing claims are not proof of correctness.
- **Atlas Core Tally** describes mobile stocktake/goods-in, scanning current plant labels, dispositions such as dead/poor/quarantine/not found/moved, offline jobs syncing to Core, and separately granted count/receive/photo/review permissions. It says Android today and iPhone later. Demonstrate current tag formats/manual lookup, cost, collision behavior and address segregation.
- **Spriggo** describes plant batches, moves/splits/merges/lineage, worker scanning/moving/care events and sales/order features. Its site advertises 90 days free then $300/month and describes active development with New Zealand nurseries. Twelve months at that list price is $3,600 before setup, equipment, taxes, training or add-ons, leaving at most $1,900 under a first-year reading of the ceiling. Its page lists production planning, customer price lists, photos and batch holds as coming next. Browser extraction returned no page text; the claims came from the vendor's search result/home page. Confirm price, seats, offline behavior, current features and export.

A vendor demo should test disconnected movement, overlapping edits on two devices, split/loss, missed readiness, order promise safety, worker access without customer PII, and full data/history export. Require vendors to show queued, rejected, duplicate and conflicting actions in the actual product.

### General inventory ERP

ERPNext's batch model groups units of one stock item under an identifier. Batch identity is required on every stock transaction for batch-enabled items. It supports movement and splitting; selection filters consider item, warehouse, expiry, posting date and actual quantity. Version 15 docs say ordinary negative stock is disallowed for batch/serial items; a per-batch override warns of valuation risk.

The pinned v15.122.0 schema has a required unique batch ID, an Item link restricted to stocked/batched items, optional parent batch, manufacturing/expiry dates, read-only Float batch quantity, and read-only UOM link fetched from the stock item. Quantity is a derived balance with a unit, not a germination forecast or promise. ERPNext permissions span role, document type, field permission levels 0–9 (fields default to 0), lifecycle operations and user restrictions. Hiding an address field is not enough; test list, search, links, exports, reports, attachments and APIs. Inspected sources did not establish ready offline worker use. Treat ERPNext as a configure-and-operate business system unless a demo proves offline fit, cost and adoption.

ERPNext v15 moved serial/batch references into a linked Serial and Batch Bundle to address data integrity. A v15.6.1 issue then reported cancellation trouble for old pre-v15 stock and follow-up issue traffic. That history makes old-data migration/reversal validation important; it is not evidence of a verified final fix or a current open defect.

### Offline form capture

ODK Collect is a low-cost narrow pilot option, not a complete inventory ledger. Blank forms must be downloaded before use. Collect can save drafts offline; offline finalized submissions wait in Ready to send until connection returns. Central recommends Collect for enumerator-mediated offline work. ODK Web Forms do not support offline submission; distinct Enketo offline mode queues work and auto-sends only while the form remains open when connection returns.

Collect supports constraints, calculations, repeats, multilingual labels, barcodes and numeric answers. It can capture append-only move/loss/pick events and Central can export CSV or OData. It does not itself provide atomic shared-stock reservation or live offline inventory. A full system still needs event-ID deduplication, stale/out-of-order validation, a central accepted ledger, and visible accepted/rejected feedback. Use it to prove the data fields, language, movement terms and counts in the two-family pilot, or retain a separate central ledger. Existing tags can remain if the form records their current IDs.

Offline finalization matters: when offline or auto-send is off, entries need finalization before they queue, and finalized entries are not normally editable. Editing sent/finalized submissions is an explicit opt-in; manual edits must be sent in order. Prefer a correcting event linked to an earlier event over changing history. Download forms/reference choices before entering dead zones. Do not assume a plain browser form works offline.

### Local-first app architecture

RxDB docs provide an architecture example, not a required dependency. Clients can read/write offline and replicate later. Checkpoints need deterministic ordering (timestamp plus stable ID is one approach), reconnect needs catch-up, retries may duplicate a write if the server accepted it but the response was lost, and client clocks cannot be trusted. The default conflict resolver discards the client fork in favor of server state. The docs say there is no cross-client ACID transaction across intermittently offline devices; one document write is atomic, and stale concurrent local writes can raise 409.

Do not let seasonal phones decrement one shared batch-quantity field offline. A small custom product should record immutable movement/count/pick events with unique event IDs, explicit batch/unit, source/destination, actor/device, local capture and server receive time, prior/event link, and sync/acceptance state. The server deduplicates, checks allocation/quantity rules, and computes balances from accepted events. Keep a reconciliation screen and stale-snapshot signal when concurrent offline actions overlap. No app implementation or sandbox witness was available or run.

## Candidate operating model

1. Keep paper tags/calendar; map current visible tag/tray IDs to digital batch IDs. Only add removable codes if workers prefer them after a trial. Never put customer names on bench tags.
2. Separate variety, propagation batch, tray/tag, location, readiness interval, physical count/unit, allocation, movement/loss/pick events and fulfillment record. Do not collapse forecast, counted stock and held/sold quantity.
3. Show readiness as an interval with review date/uncertainty. A reviewed count at an agreed operation may raise firm allocatable stock; expected yield stays a forecast. Use named statuses and text plus symbols, never color alone.
4. Let disconnected workers record queued moves/observations, but binding order holds/promises need coordinator confirmation or another explicitly chosen single-writer rule. Stale data should be marked stale and not marketed as guaranteed availability.
5. Keep names/addresses out of worker forms and phone reference data. Use opaque allocation IDs for field work and a separately authorized fulfillment view. Check exports, search, notifications, attachments, caches and linked entities. Encryption does not replace data minimization.
6. Make count units explicit. Ask whether sales are plants, flats/trays or mixed, whether trays are divisible, and any conversion from nursery count to order units. Do not infer fractional plants from ERP Float fields.
7. For the two-family pilot, include family/variety, batch, tag/tray, structure/bench, movement endpoints, event quantity/unit, expected readiness start/end, count date, disposition, opaque order reference, actor and capture/sync/reconcile times. Do not promise wholesale, accounting, irrigation or automated forecasting.
8. When a readiness window passes, flag for human review; do not silently extend, substitute, cancel or contact a customer. Ask whether to allow partial fulfillment, hold a replacement, cancel/refund, and when/how the customer is contacted.
9. Clarify if $5,500 means one-time or first-year. Request setup, recurring license, 20 seasonal seats, devices/scanners, hosting, support, migration/export, tax and training. Include coordinator admin and seasonal onboarding time.
10. Keep paper fallback and define who reconciles and when. Decide whether propagation lead updates losses/readiness while packer records picks, or who owns counts, before automated availability is enabled.

## Issue evolution and uncertainty

Collect issue #1703 describes unclear errors when connectivity interrupts form download/submission. A 2020 comment says v1.28.0 improved form-list connectivity messages but individual form failures remained generic. In October 2021 a maintainer says issue #4489 addressed manual-download messaging and the pattern would be applied to remaining downloads/uploads, then closes #1703 as covered by other work. This supports durable queue/receipt/error requirements; it does not prove an upload fix shipped in a particular release. Issue #4489 is itself an issue, not called a merged PR here.

Strongest evidence: official ODK workflow/permission docs, ERPNext pinned v15.122.0 batch schema/code, and current RxDB replication/conflict docs. Vendor pages are discovery leads; offline guarantees, privacy, price and contract claims require demonstration/quote. Open questions are tag format/data quality, current device/OS, offline duration, nursery units, municipal order semantics, allocation authority, missed-window response, budget interpretation, second language, local retention and vendor terms. No code was run and no witness/test is claimed.
