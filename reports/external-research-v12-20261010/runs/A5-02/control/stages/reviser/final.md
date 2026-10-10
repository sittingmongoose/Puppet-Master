# Complete research proposal — Returnable crate receiving labels

Run A5-02-control · reviser stage · planning proposal, not an implementation. Scope is identifiers and scanning workflows for the three-depot cooperative; payment and food-safety decisions are out of scope.

## Recommendation

For the pilot, use one durable, cooperative-controlled local `crate_id` for each physical reusable crate. The inventory steward must select and govern the namespace. Print the ID in readable text and as a 1D Code 128 symbol. Keep it unchanged through depot moves, contents changes, repeated trips, and label replacement. A human can still read the identifier without a scanner; local barcode decoding does not by itself make an application or receipt workflow work offline.

Record shipment/manifest references separately from crate identity and from each confirmed receipt or return event. A scan is a candidate lookup, not a receipt. Staff must confirm the operation and depot before an event is accepted.

Retain the brief-authorized public crate-care QR as an **optional** addition to the readable staff ID. If the web owner can maintain an appropriate public route and privacy boundary, use the same short cooperative URL on each crate and serve general care/cleaning instructions only. The QR must not disclose a crate's status, depot, staff, receipt, or movement history. If that route cannot be maintained or reviewed, omit the QR and keep the readable ID; its optional status does not reduce the need to research it. No identifier allocation is needed for a simple cooperative URL. GS1 GRAI/Digital Link is a close future interoperability analogy, but this pilot must not buy an allocation or claim a GS1-conformant identifier.

Odoo Inventory 18.0 is the closest researched warehouse/package example; Snipe-IT supplies an asset-label pattern; Sortly is a phone-first offline alternative worth evaluating if connectivity is a deciding constraint. They are comparison candidates, not selected products. Depot managers must decide whether scans may queue offline before any queueing behavior becomes a local requirement.

## Evidence, inference, and local choice

**Observed in external sources:** Odoo 18 documentation describes real-time barcode receipt operations, scanning products/packages and validating an operation; its generic WHIN command starts a new receipt, while an already scheduled picking has its own barcode/reference. Odoo distinguishes an individually tracked physical package, which can be reusable or disposable, from product packaging whose barcode can denote a repeated type/quantity. [S07](sources/index.md#s07) [S08](sources/index.md#s08) [S09](sources/index.md#s09)

Snipe-IT documentation describes unique asset tags within its system, a 1D barcode search path separate from a QR that opens the asset page, and an asset check-in/out model. Its manual discourages checking assets out to locations. The asset-page QR depends on the host being reachable. Its v8.3.6 barcode manual says changing APP_URL requires refreshing generated barcode images; that is version-specific and must not be assumed for a later tag. [S01](sources/index.md#s01) [S02](sources/index.md#s02) [S03](sources/index.md#s03) [S17](sources/index.md#s17)

Sortly's help describes mobile-only offline mode: staff disable sync, edit the device's existing inventory snapshot, then manually sync later. Its phone camera can scan QR and barcodes; a 1D-only scanner cannot read QR, which needs a 2D imager or camera. The web app is not offline and web scanning cannot check items in/out. This documents inventory-level offline updates, not a durable multi-depot receipt-event queue with proven ordering, conflict handling, or idempotent replay. [S10](sources/index.md#s10) [S11](sources/index.md#s11)

GS1 GRAI (AI 8003) is an unusually close analogue for a returnable asset such as a crate: a shared asset type can have an optional serial to distinguish physical instances, and the asset key must not identify the carried trade item. It depends on an assigning organization's GS1 Company Prefix. Digital Link is a URL-shaped web URI, and a resolver can direct an identifier to a default or requested resource. These are standards facts, not evidence that the cooperative has a namespace, allocation, resolver, or compatible device. [S12](sources/index.md#s12) [S13](sources/index.md#s13) [S14](sources/index.md#s14) [S16](sources/index.md#s16)

**Inference for this pilot:** Odoo's package model is a useful fit if the cooperative needs location/content tracking; Snipe-IT illustrates a persistent asset tag but its location-custody guidance is a mismatch for depot transfers; Sortly is a candidate if phone scanning and intermittent connectivity matter. A hybrid record model can use these ideas without adopting a vendor. No product selection follows from the available evidence.

**Local proposal:** a cooperative-controlled stable key, separate shipment and event records, and a care-only shared QR subject to web-owner conditions. This is a planning recommendation, not an observed external behavior or implemented design.

## Reconciliation with every brief obligation and released plan clause

### 1. Compare two workflows and an analogous identifier/resolver mechanism

The comparison above covers Odoo 18 receipts/packages and Snipe-IT asset labels, with Sortly as an offline-focused alternative and GS1 GRAI/Digital Link/resolver as the analogous identifier mechanism. The plan's proposal to put a current shipment number in the barcode, reuse it for future trips, and treat any successful scan as a receipt is rejected. One shipment can include multiple crates and be partially received; one crate can participate in many shipments; a scan can be mistaken, duplicated, or made at the wrong depot. None proves acceptance.

For low-cost scanning, plain text needs no device; a phone camera may scan without separate reader hardware where the chosen app supports it. A conventional 1D reader can serve the staff Code 128 path. A 1D-only reader cannot read the optional QR. A phone or 2D reader can decode a URL without understanding depot events, but fetching a web page or resolver target still requires network access (or a separately established cache). Scanner decode, online resolution, and receipt acceptance are three distinct steps. [S02] [S11] [S13] [S16]

### 2. Keep four identities distinct

- **`crate_id`:** one durable identity per physical reusable crate; steward-selected namespace; never derived from shipment, contents, depot, or current status.
- **`shipment_id`:** external manifest, delivery, or transfer grouping; may contain many crates and be partially received. It is not a crate identity or receipt event.
- **`product_id`:** optional cargo SKU/catalog identity; distinct from the crate and its type. GRAI likewise identifies the returnable asset, not its contents. Food-safety decisions remain out of scope.
- **`receipt_event_id`:** unique identity for one accepted receipt or return. Proposed fields include crate ID, event type, depot, time, actor, optional shipment reference, outcome/status, and any correction link. Repeated cycles get new event IDs; corrections preserve the original event and record the correction.

A `crate_type_id` may classify a model or dimensions, but does not identify a particular crate or product. If managers authorize offline queueing, create a stable client event key before retry/sync, mark it pending until accepted, and make replay idempotent. These are local design recommendations, not product behavior verified by this research.

### 3. Optional QR/resolver links, decoding, redirection, and label replacement

Keep human-readable text and the 1D staff lookup path usable independently of the optional QR. A phone camera, QR reader, or 2D scanner can decode the QR; a general scanner can treat a Digital Link URI as a URL. URL decoding is distinct from checking GS1 conformance, resolving a link, or recording a receipt. [S02] [S11] [S13] [S16]

A shared static cooperative care URL is the simplest optional path and does not need a GS1 resolver. If a stable redirect or future resolver is adopted, the web owner governs its destination, default, requested link types, missing-link behavior, availability, and change process. Resolver 1.2.1 specifies a default link and a requested `linkType` redirect when available; an unavailable requested type returns 404 rather than silently falling back to the default. [S14]

**Accepted correction C-01:** amend the investigator draft's description of query forwarding. Resolver 1.2.1 §2.12 says that, when redirecting, a resolver SHALL transmit the entire incoming query string by default. The standard's version 1.2.0 change-log subsection says the prior option to omit query parameters was removed. Therefore the QR URI and query must contain no staff/depot state, credentials, movement history, or other sensitive values. Keep the care page generic and propose testing the complete redirect/query path if a resolver is ever used. This does not change the shared static care-URL recommendation. My independent primary-source check also found that the query-omission change is recorded under the 1.2.0 change-log entry; the critic's locator of it as §9.3/1.2.1 is corrected in the source map. No resolver was configured or called. [S14](sources/index.md#s14)

For a damaged label, replace it with the same `crate_id` and approved QR payload; record a label-replacement event/revision and remove or invalidate the damaged label. Do not mint a new crate identity. A direct host/path change can require reprinting. A stable redirect can preserve a printed URL while the web owner changes its destination, with corresponding availability and redirect-governance duties. Snipe-IT's v8.3.6 cache instructions are historical/version-specific, not a guarantee about current versions. [S14] [S17]

### 4. Parsing/format migration and released behavior changes

- Snipe-IT issue #19515 reports that on v8.7.1, legacy “QR Code Text” could be lost when switching to the new label engine. PR #19633 added a one-time transfer into the new engine's label title; it merged to `develop` on 2026-09-17, and the issue closed with commit `c1d1cd1` on 2026-09-23. This is a Snipe-IT label-configuration migration, not a general scanner defect. Although v8.8.0 tag `2c466fa` was released 2026-09-30, ancestry of the fix in that tag was not checked, so do not claim it is included. [S04](sources/index.md#s04) [S05](sources/index.md#s05) [S06](sources/index.md#s06)
- Resolver release 1.2.1, ratified August 2026, corrects serial-number AI 17 to AI 21 in §2.5.10. This is bounded to the GTIN hierarchy and does not redefine GRAI AI 8003, local crate IDs, QR decoding generally, or receipt semantics. [S14](sources/index.md#s14)
- GS1 Syntax Engine 1.4.1, commit `ec595ff`, reports a fix for overflow on very long Digital Link URI stems. This is version-specific parser history, not a universal scanner issue. The library was not installed or executed; a future integration should pin its version and test expected URIs. Keep labels' URLs short and event history server-side. [S15](sources/index.md#s15)

These histories justify a post-migration/format validation proposal; they do not show that the cooperative's scanner, labels, app, or parser was tested.

### 5. Preserve the authorized optional public-care QR

The QR remains authorized optional scope, not a mandatory feature or an established technical capability. Retain it only if the web owner can maintain a stable public route and approve its content/privacy boundary. Prefer one shared URL to general care instructions, in addition to the staff-readable ID. There is no evidence-based reason to remove the option now. If route ownership, access, privacy, or later validation cannot be established, omit the QR while retaining the readable identifier. A QR scan never records a receipt.

### 6. Preserve owner authority and the shipment invariant

- **Inventory steward:** selects the identifier namespace and governs uniqueness, allocation, retirement, and reconciliation with the legacy sheet. No choice has been obtained.
- **Depot managers:** decide whether scans may queue offline. If they decline queueing, acceptance requires live confirmation. If they allow it, pending/accepted status, stale-data conflicts, stable event keys, retries, ordering, and reconciliation must be specified and tested before enabling it. No choice has been obtained.
- **Web owner:** governs the public care URL, any redirect/resolver, and its content/privacy and availability policy. The route and policy are unconfirmed.
- **Invariant:** a shipment number remains a shipment reference and must not silently replace `crate_id`.

These unresolved inputs do not excuse public research already completed, and no owner decision is represented as having occurred.

### 7. Binding negative constraints

Do not buy identifier allocations; do not print production labels; do not claim that any QR scan is a verified receipt; do not publish depot movement history through the public care link. The proposed local namespace, unprinted label concepts, separate staff-confirmed event, and generic care page preserve these constraints.

### 8. Complete proposal and validation boundary

The recommendations, alternatives, source/version applicability, useful findings, unresolved inputs, corrections, and validation status are included here and in the navigable [source index](sources/index.md) and [source identity map](source-map.json). Public documentation, standards, source code, and release-history retrieval are research evidence only.

| Check | Status | Scope/result |
|---|---|---|
| Read assigned brief, frozen investigator discovery/draft/source map, exact released plan, and full critic critique/source map | EXECUTED | Reconciled each numbered obligation and plan clause; plan treated as fallible draft. |
| Public documentation, standards, source, and release/fix-history review | EXECUTED as research only | Source IDs S01–S17; includes critic review and the independent S14 primary-source recheck. Not product validation. |
| Local prototype, vendor account, scanner pairing, QR/production label, resolver/parser operation, live deployment, or network/offline test | NOT_RUN | No app, account, hardware, label, resolver, parser, live service, installation, or production access was used. |
| Reconcile legacy IDs and steward-selected namespace | PROPOSED / NOT_RUN | Steward checks uniqueness, leading zeros, duplicate/invalid historical values, retired crates, and replacement labels before any label is produced. |
| Pilot scenario checks | PROPOSED / NOT_RUN | Walk through partial receipt, repeated crate cycles, return, damaged label, duplicate scan, wrong depot, and shipment-number mismatch; confirm separate event creation only after staff confirmation. |
| Readability and scanner tradeoffs | PROPOSED / NOT_RUN | Compare plain text, 1D Code 128, phone-camera QR, and 2D handheld on actual selected devices; include worn/dirty labels and offline readability. No labels were printed. |
| Offline event queue, if managers authorize it | PROPOSED / NOT_RUN | Test stale snapshots, concurrent depot edits, pending/accepted state, retry/idempotency, ordering, correction, and reconciliation after reconnect. Vendor documentation alone does not establish suitability. |
| Public-care QR, if enabled | PROPOSED / NOT_RUN | Web owner checks stable route, care-only content, redirects/default, missing route/404, outage, query propagation, privacy/logging, and continued readable-ID use when QR/network fails. |
| Future GS1 syntax/resolver adoption | PROPOSED / NOT_RUN | Pin exact standard/parser and test AI 8003/GRAI, selected decoding paths, requested link types/404, redirects, and URI migration. No allocation, resolver, or parser was used. |

The first next decision is the steward's namespace together with depot managers' offline policy. The web owner then decides whether the optional public care route can be maintained. Any pilot checks remain prospective; no product choice or production-label activity is authorized by this proposal.

## Critique dispositions

- **C-01 — Accept and amend.** The critique correctly identified that the original draft understated the resolver's query-forwarding rule. The standard requires full query transmission by default when redirecting, and the option to omit query parameters was removed in v1.2.0. Amend the privacy condition as above. Correct the change-log locator to its v1.2.0 subsection; v1.2.1's change-log entry concerns the serial AI correction. This is a research/source-interpretation correction; no resolver was run.
- **C-02 — Retain uncertainty.** The critique correctly treats the missing steward, depot-manager, and web-owner decisions as expected external inputs, not a defect. They remain explicit and unresolved; the proposal records the impact of each decision.
- The critic found no additional material wrong claim, omission, or unsupported recommendation. Its agreement does not substitute for the evidence and primary-source recheck above.

The exact native Goal activation response is preserved in [native-goal-activation.json](native-goal-activation.json). Native Goal completion is performed only after this proposal and its source map are saved.
