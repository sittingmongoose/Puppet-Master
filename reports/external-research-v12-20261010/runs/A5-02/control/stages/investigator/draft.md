# Complete research proposal — Returnable crate receiving labels

Run A5-02-control · investigator stage · planning proposal, not an implementation.

## Recommendation

Use a steward-selected local namespace for immutable `crate_id` values during the pilot. Put the same ID in plain readable text and a 1D Code 128 symbol. Keep shipment references and each confirmed receipt/return event in separate records. Treat a scan as lookup input; require staff confirmation before recording an accepted event.

Retain the authorized QR option conditionally. If the web owner can provide and maintain a stable public route, encode a shared cooperative crate-care URL on labels in addition to the staff ID. Keep the page general and free of crate, depot, staff or movement history. The shared route needs no identifier allocation or resolver. If the cooperative later needs per-crate links or multiple redirect targets, GS1 GRAI plus Digital Link is a relevant future model, but acquiring a GS1 prefix/identifier is outside this pilot and no allocation should be purchased.

Odoo Inventory 18.0 is the strongest researched example for warehouse receipts and individually tracked physical packages; Snipe-IT illustrates unique asset tags and a label with separate 1D and QR paths; Sortly documents a phone-first offline alternative. These are comparison candidates, not product selections. None was run against the cooperative scenario. Depot managers must decide whether offline event queuing is permitted before a queueing design is treated as a requirement.

## Per-clause reconciliation with the released plan

### 1. Compare two receiving/asset-label workflows and an analogous identifier/resolver mechanism

**Disposition: Correct the draft's shipment-label and scan-equals-receipt claims; retain the comparison requirement.**

The draft says to put a current shipment number in the barcode, reuse that label, and treat any successful scan as a receipt. Reject all three. A shipment can contain many crates and recur across events; a crate keeps one identity through many shipment cycles; a scan can be a mistaken lookup, a duplicate, or a scan of the wrong depot's crate. None of those facts establishes that staff accepted a receipt or return.

| Candidate | Documented behavior | Pilot fit and limits |
|---|---|---|
| Odoo Inventory 18.0 | Barcode app processes receipts and deliveries as inventory operations, lets staff scan products/locations/packages and validate. Individual physical Packages can be tracked with unique package barcodes and contents, and can be configured reusable or disposable. Product Packagings represent product-specific fixed groupings and their barcode may be reused for the same package type. [S07–S09] | Closest researched warehouse/package workflow. It makes a useful crate-versus-cargo distinction. It is documented as real-time; these sources do not establish offline event queueing. The generic WHIN command creates a new receipt. Processing an already scheduled receipt requires its specific picking barcode/reference. A command code or shipment number therefore must not stand in for a crate ID or receipt event. [S07–S09] |
| Snipe-IT | Each asset tag is unique within Snipe-IT. Its label can show a 1D barcode for USB/Bluetooth asset search and a QR that opens the linked asset details page on a mobile QR reader. Check-in/out models asset possession, but the manual discourages checking assets out to locations. [S01–S03] | Useful asset-label pattern; not a complete shipment-receiving ledger. A web QR needs the host reachable. Location-based custody is not the manual's recommended workflow. Treat URL/cache behavior as version-specific: v8.3.6 docs say APP_URL changes require barcode-cache regeneration; the current-version issue history also shows label-engine migration can affect QR payload settings. [S04–S06, S17] |
| Sortly mobile | The mobile app uses a phone camera to scan QR and barcodes. Its offline mode is mobile-only: disable sync, work from the device's current inventory snapshot, then restore sync so changes reach the account. [S10, S11] | Useful phone-first alternative for intermittent connectivity without an extra scanner. Vendor help describes offline inventory-level changes, not a multi-depot event queue with demonstrated ordering, conflict or idempotency behavior. Its web app is not offline and web scanning cannot check in/out. These gaps need a pilot-specific check. |

For a low-cost scanning option, a phone camera can decode QR/barcode without purchasing a separate reader where the chosen app supports it. A conventional 1D reader is a simpler staff-code path for Code 128; a 1D-only reader cannot read QR, which requires a 2D imager or phone camera. Decoding a URL is different from loading its page: without a network or cached destination, a resolver/public page cannot be fetched. A scanner's local decode also does not make an application offline-capable. [S02, S11, S13, S16]

**Analogous mechanism.** GS1 GRAI (AI 8003) is specifically defined for returnable assets such as crates. It can identify a type shared by identical assets and add an optional serial to distinguish each physical instance; its standard explicitly says not to use the asset key for the trade item it carries. GS1 Digital Link expresses an identifier in a web URI; a conformant resolver can direct the URI to a default resource or requested link type. This is a close standards analogy, not evidence that the cooperative has a GS1 namespace or working resolver. GRAI depends on the issuer's GS1 Company Prefix, which is outside scope because no allocation purchase is authorized. [S12–S14]

### 2. Distinguish crate, shipment, product and receipt-event identity

**Disposition: Expand and enforce distinct keys; do not embed the shipment number as the crate barcode.**

- **Crate identity — `crate_id`:** one durable key per physical reusable crate. The inventory steward chooses its namespace, uniqueness and allocation rules. Keep the ID stable through moves, label replacement, contents changes and repeated trips.
- **Shipment identity — `shipment_id`:** external manifest/load/transfer reference. It groups expected crates and can be partially received; it is not a reusable crate identity or a confirmed event.
- **Product identity — `product_id`:** cargo SKU/catalog identity when needed. It does not identify its container. A separate optional `crate_type_id` may describe a crate model but still does not identify one physical crate.
- **Receipt-event identity — `receipt_event_id`:** one unique record for one accepted receipt or return operation. Recommended fields are crate ID, event type, depot, occurred/recorded time, actor, optional shipment reference, confirmation/outcome and any correction link. A repeated receipt/return gets a new event ID; correction should preserve the original event and record the correction.

The record relationship is one crate to many events. A shipment can link to many crate-events and a partial delivery can have more than one receipt event. If offline queueing is permitted, allocate a stable client event key before retry/sync, represent pending versus accepted state, and ensure replay cannot create duplicate events. These are proposed data rules, not behavior observed in Odoo, Snipe-IT or Sortly.

### 3. Research optional QR/resolver links, decoding, redirection and label replacement

**Disposition: Reject the assumption that handheld parsers make a QR destination available offline. Preserve the QR as an optional link alongside the staff-readable ID.**

Supported paths found:

1. A human reads the printed crate ID without any device.
2. A 1D Code 128 scanner sends the staff ID through the compatible scanner/search path.
3. A phone camera, QR reader or 2D scanner decodes the optional QR. GS1 Digital Link is URL-shaped, so general scanning apps can treat it as a URL; recognizing a string as GS1-conformant is a further syntax check.
4. If the QR contains a URL, retrieving its care page/resolver target is a separate HTTP(S) operation and can fail offline, on a missing route, or when the web service is unavailable. [S02, S11, S13, S16]

For this pilot, prefer the same cooperative-controlled public care URL on every crate. The visible/1D crate ID remains the staff identity. A generic page is sufficient for cleaning/care guidance and avoids a public per-crate lookup. A stable cooperative redirect may be used if the web owner needs to move the page later. If a future GS1 resolver is selected, current Resolver 1.2.1 specifies a default link, redirect to a requested link when available, and 404 for an unavailable requested link type; query parameters are forwarded by default. Do not put staff/depot state or movement data in the public URI or target. [S13, S14]

For a damaged label, reprint the same crate ID and approved QR payload, record label replacement/revision, and remove or invalidate the damaged label. Do not mint a new crate identity just because its label failed. A direct host/path change can make old URLs stale and require physical relabeling; a stable redirect allows the web owner to change a target while retaining the printed URL, with an ongoing redirect-ownership obligation. Snipe-IT v8.3.6 docs call for clearing the generated barcode cache after an APP_URL change, so validate any selected release and generated label configuration rather than assuming old images update themselves. [S14, S17]

### 4. Investigate parsing/format migration or released scanner behavior change

**Disposition: Correct the draft's “no history investigated” status with bounded release and fix evidence; preserve the limit on applicability.**

- Snipe-IT issue #19515 reports that, on v8.7.1, legacy `QR Code Text` could be lost when enabling the new label engine. PR #19633 changes the source transition to copy the QR text into the new engine title once. The PR commit 1e0fc8c merged into `develop` on Sep 17, and issue closure cites merge commit c1d1cd1 on Sep 23. This history is specific to Snipe-IT label configuration/migration. Snipe-IT v8.8.0 (tag commit 2c466fa, Sep 30) is a later release, but ancestry of the fix into that tag was not established, so presence in that release remains uncertain. [S04–S06]
- GS1 Resolver 1.2.1 ratified Aug 2026 records an erratum in §2.5.10 correcting serial-number AI 17 to AI 21. The cited section is the GTIN hierarchy; the correction is not a general QR-decoder change and does not redefine GRAI AI 8003 or a local crate ID. [S14]
- GS1 Syntax Engine 1.4.1, commit ec595ff, lists a fix for overflow on very long Digital Link URI stems. The project processes GS1 syntax, Digital Link and scanner data. If a future integration uses it, pin the release and test its inputs; keep printed URLs short and store movement history server-side. This library was not installed or run. [S15]

These examples justify post-format/migration checks, not claims that scanner hardware has a universal behavior or that the cooperative has a GS1 parser. They do not change the simple local-ID pilot recommendation.

### 5. Retain the optional public crate-care QR

**Disposition: Retain as authorized optional scope; neither remove it nor make it a mandatory feature.**

The brief itself authorizes a QR to a public care page in addition to the staff-readable inventory ID. That authorization is the reason to keep the option under investigation; it does not establish a working page, scanner, resolver or selected design. Evidence shows ordinary URL QR decode paths and resolver mechanisms exist, but they require the selected decoding equipment and, for page retrieval, a reachable URL. [S02, S11, S13, S16]

Recommended conditions: web owner controls a stable cooperative URL and redirects; page is publicly reachable and contains care instructions only; no depot movement, staff, receipt or crate-specific status is exposed; a scanned QR never records a receipt; staff ID remains readable if QR fails or the network is down. No evidence-based exclusion is currently established. If the web owner cannot maintain an appropriate route or validation later reveals an unacceptable exposure/availability issue, record that evidence and keep the readable crate ID regardless.

### 6. Make owner decisions explicit

**Disposition: Preserve the stated authority; leave the decisions unresolved rather than filling them with implementation assumptions.**

- **Inventory steward:** selects the identifier namespace and allocation/retirement rules. Candidate now: internal cooperative namespace. GRAI can be revisited for external interoperability only after an authorized future allocation decision; none is made here.
- **Depot managers:** decide whether scans can queue offline. Sortly shows one vendor's mobile-only manual-sync pattern, not proof that this cooperative should queue events. If managers say no, require live confirmation before accepting an event. If yes, define pending/accepted states, stable event keys, conflict handling and replay tests before enabling the queue.
- **Web owner:** governs care URL and any redirect. A shared static page is the simpler optional path; a resolver is a later option with redirect, default/404, query and outage behavior to own.
- **Invariant:** shipment number must not silently replace crate ID. It remains a shipment reference, even if it is printed on a document or used to find an operation.

No owner decision was obtained during this research.

### 7. Preserve negative constraints

**Disposition: Binding and retained without exception.**

- Do not buy identifier allocations.
- Do not print production labels.
- Do not claim that any QR scan is a verified receipt.
- Do not publish depot movement history through the public care link.

The design above respects these limits: internal local IDs are the pilot recommendation; all label/scanner work is proposed; receipt confirmation is a separate staff-authorized event; the QR target is generic care information only.

### 8. Deliver the coherent evidence-backed proposal and validation table

**Disposition: Complete in this document; product validation remains unperformed.**

The sources and applicability limits appear in [sources/index.md](sources/index.md) and [source-map.json](source-map.json). Public docs, standards, source and release/fix history were retrieved as research. They are not successful product runs.

| Check | Status | Result or proposed observation |
|---|---|---|
| Primary documentation, standard, code and release-history research | EXECUTED as research only | Sources S01–S17. Does not establish cooperative product behavior or a working pilot. |
| Read/compare the assigned brief and released plan | EXECUTED | Discovery was completed and frozen before the one-time plan release; this is planning evidence, not product validation. |
| Local prototype, vendor account, scanner, QR label or resolver operation | NOT_RUN | No installation, account, local scanner, label print, resolver call, live write or production access was used. |
| Select namespace and reconcile legacy IDs | PROPOSED / NOT_RUN | Steward resolves uniqueness, leading zeros, duplicates, retired crates and preserved old references before any label is produced. |
| Pilot walkthrough for receipt, partial receipt, return, damaged label, duplicate scan, wrong depot and shipment-number mismatch | PROPOSED / NOT_RUN | Confirm the record creates one separate event only after staff confirmation; repeated cycles use the same crate ID and new event IDs. |
| Test physical/readable and scan paths on available hardware | PROPOSED / NOT_RUN | Compare plain text, 1D Code 128, phone camera QR and 2D handheld; test worn/dirty labels. No product or scanner has been selected. |
| If managers authorize offline queueing, test offline event capture and reconnection | PROPOSED / NOT_RUN | Verify stale data, two-depot conflicts, pending state, duplicate retry/idempotency, ordering, correction and reconciliation. Do not infer these from decoder operation. |
| If QR is enabled, test public page, redirect, failure and privacy boundaries | PROPOSED / NOT_RUN | Check stable route, redirect change, missing route/404, outage, query forwarding, no movement history and QR failure while readable ID remains usable. Web owner approves. |
| If adopting GS1 parsing/resolution later | PROPOSED / NOT_RUN | Pin exact standard/library, test AI 8003/GRAI and chosen link types, defaults, 404 and URI migration. No GS1 allocation or parser setup occurred. |

No research source or future validation above is reported as executed product validation. The next action is an owner decision on the identifier namespace and offline policy, then a small, reversible pilot validation before a product choice or production-label activity.
