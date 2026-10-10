# Independent discovery — returnable crate receiving labels

Run: A5-02-control / investigator. Discovery input: the complete assigned brief only. Plan has not yet been released or consulted. Public-source observations below are separated from local recommendations. Source identities and locators are indexed in [sources/index.md](sources/index.md) and [source-map.json](source-map.json).

## Preliminary recommendation

For a three-depot pilot, keep one steward-selected, immutable local `crate_id` on every physical reusable crate. Print it in large plain text and as a compact 1D Code 128 symbol. Add the brief-authorized QR only if the web owner can keep a stable public care-page route and review what it exposes. The QR should open general crate-care instructions, not a crate-specific location or movement record. This preserves a readable/scannable inventory key when the network is unavailable and avoids buying identifier allocations or coupling staff receipt actions to a consumer web link.

Record a shipment/manifest reference separately from a local receipt or return event. A shipment can include multiple crates and can be partially received; one crate can participate in many shipment cycles. A scan identifies a candidate crate; it is not a receipt. A receipt/return event is recorded only after a staff member confirms the operation and depot. Store each event independently and relate it to the crate and, where known, its shipment. The legacy sheet's separation of crate identity from shipment is therefore worth retaining and formalizing.

## Workflow comparison and useful alternatives

| Workflow | Observed fit | Limits and pilot use |
|---|---|---|
| Snipe-IT asset labels/check-in/out | Asset tags are unique within the system. The label workflow can show a 1D barcode for USB/Bluetooth search and a QR that opens the asset page on a phone. [S01–S03] | It is asset-centric rather than a receiving ledger. Its documentation discourages checking assets out to locations, so use it as an identity/label pattern, not as evidence that its default lifecycle exactly fits depot transfers. A QR that opens a record needs access to the host. The older v8.3.6 barcode manual says changing the system URL requires refreshing generated QR images; confirm current-version behavior before adopting it. [S02, S03, S17] |
| Odoo Inventory 18.0 Barcode | Receipts are operations that staff select/scan, process against purchase orders and validate; locations and physical packages can be scanned. Odoo distinguishes an individually barcoded physical package from product-specific packaging: a package has contents and can be configured reusable or disposable, while a packaging barcode represents a fixed product grouping and is not a unique pallet/crate ID. [S07–S09] | The receipt workflow is documented as real-time. The generic WHIN command creates a new receipt; staff must scan/print the specific picking reference to process an already scheduled receipt. This is a useful warning against treating a command barcode, shipment number, or crate label as the receipt event identity. No offline queue behavior was established from these docs. [S07, S08] |
| Sortly mobile as an offline-focused alternative | The phone camera can scan barcodes and QR codes without separate scanner hardware. Offline mode exists on mobile only: staff disable sync, work from the inventory snapshot then on the device, and manually sync changes on reconnection. A 1D-only scanner cannot read QR; a 2D imager/camera is required. [S10, S11] | The vendor describes offline changes as inventory-level updates, not a durable multi-depot receipt-event protocol; the web app has no offline mode and web scanning cannot check items in/out. This is worth evaluating if low-cost phone scanning and temporary signal loss dominate, but the cooperative must verify transaction history, stale-state conflicts, and duplicate sync for this use case. Do not infer those controls from the offline feature description. |

**Inference for the pilot:** Odoo's physical-package model is the closest documented match when each crate must be located and its contents/moves tracked; Snipe-IT shows a simple persistent asset-label pattern; Sortly is a possible phone-first offline alternative. A hybrid record model can use these ideas without selecting or implementing any vendor product. The brief does not establish a product purchase decision.

## Keep four identities distinct

| Identity | What it names | Proposed relation |
|---|---|---|
| `crate_id` | One durable reusable physical crate. Steward chooses its namespace. Never derive it from contents, depot, shipment or current status. | Primary key for the crate record and every label. |
| `shipment_id` | An external manifest, delivery or transfer grouping. It may contain many crates and may be only partially received. | Reference/grouping on one or more event records; not a replacement for `crate_id`. |
| `product_id` | A catalog/SKU identity for the food or other trade item carried in a crate. It is distinct from the crate; GRAI rules explicitly prohibit using a returnable-asset identifier for the carried trade item. | Optional cargo reference only if the workflow needs it. Do not pull food-safety decisions into this scope. |
| `receipt_event_id` | One particular accepted receipt or return action, even when the same crate and shipment appear in earlier/later events. | Unique immutable event key with crate, event type, depot, time, actor, shipment reference, and outcome/status. |

A separate `crate_type_id` may classify dimensions/material if useful, but it does not identify an individual crate or the transported product. If offline queuing is authorized, generate a stable client event key before sync; mark it pending until the server accepts it, and make retries idempotent. These are design recommendations, not observed behavior of any product.

## QR/resolver, decoding, and replacement

**Observed external behavior.** Snipe-IT documents QR labels that open a linked asset page in a phone QR reader, while a separate 1D barcode feeds asset-tag search. Sortly says its camera scanner handles QR/barcodes and that QR needs a 2D-capable scanner. GS1 Digital Link URI syntax 1.7.0 treats the encoded URI as an ordinary URL, so general phone camera/browser/QR-reader paths are available; a decoder need not understand depot events. The GS1 resolver standard 1.2.1 supports a default redirect and a requested `linkType`; a missing requested link type returns 404. By default it forwards query parameters to the redirect target. [S02, S11, S13, S14, S16]

**Recommendation.** Keep the staff identity legible and independently scannable. The optional QR can carry the same short, cooperative-controlled public care URL on every crate. A static shared care URL requires no GS1 allocation or resolver and does not itself identify a crate. If the web owner later needs to move the care page, put a stable cooperative-owned redirect in front of it and retain control of the target. If adopting a resolver, test its default, unknown-link behavior, query forwarding and outage response; a failed or redirected QR must never silently alter the staff `crate_id`.

For a damaged label, replace it with the same `crate_id` and the approved QR payload; record a label-replacement event/label revision, remove or invalidate the damaged label, and do not issue a new crate identity. A direct QR whose host/path changes may require reprinting. A stable redirect can change the destination centrally without changing the printed URL, but the web owner then owns its redirect policy and availability. Snipe-IT's older v8.3.6 documentation specifically calls for barcode-cache regeneration after an APP_URL change. [S17]

The authorized public-care option is supported as a proposal, not as a proven cooperative capability or a mandatory feature. Keep its page generic and public: care/cleaning instructions only, with no depot movement history, crate-specific status, receipt confirmation, or staff details. If the public route, privacy boundary, or redirect owner cannot be established, omit the QR and keep the human-readable identifier.

## Format history and applicability

1. **Snipe-IT label-engine transition:** issue #19515 was reported against v8.7.1 in August 2026: the old `QR Code Text` did not carry into the new engine and could leave the label QR blank. PR #19633 changed the transition to copy `qr_code_text` into the new engine's title once; it merged to `develop` on Sep 17, and the issue was closed by commit `c1d1cd1` on Sep 23. This is a product-specific label-configuration migration, not a universal scanner fault. The v8.8.0 release exists (tag commit `2c466fa`, Sep 30), but I did not verify that the PR commit is an ancestor of that release. Treat the fix's presence in a deployed tag as unverified. [S04–S06]

2. **GS1 resolver parsing correction:** current Resolver release 1.2.1 (ratified Aug 2026) records an erratum correcting the serial-number Application Identifier from AI 17 to AI 21 in §2.5.10. This is bounded to GS1 Digital Link GTIN hierarchy/serial parsing; it does not redefine a cooperative local `crate_id`, GRAI AI 8003, QR decoding in general, or receipt semantics. If a future integration parses GS1 links, pin the standard/library versions and test actual expected URIs. The GS1 Syntax Engine's 1.4.1 release (commit `ec595ff`) also fixed overflow on very long Digital Link URI stems; keep URLs short and store history server-side rather than packing events into labels. These histories support a parser/format migration check, not a claim that a local product was tested. [S14, S15]

The GS1 analogy is unusually close: General Specifications release 26.0 describes GRAI AI (8003) for returnable assets including crates; the asset type can identify identical crate types and an optional serial distinguishes individual crates. The same section says GRAI identifies the physical reusable asset, never the carried trade item. GRAI/Digital Link plus a resolver could connect a crate key to several web resources and redirect them over time. But GRAI uses an assigning organization's GS1 Company Prefix. The brief forbids buying allocations, so this is a future interoperability option only; the pilot should not emit or claim a GS1-conformant GRAI. [S12–S14]

## Owner decisions, constraints, and validation

**Owner decisions that remain explicit:** the inventory steward chooses and governs the `crate_id` namespace; depot managers decide whether scans may be queued offline; the web owner governs the public care URL and any resolver redirects. A shipment number must never silently substitute for `crate_id`.

**Negative constraints preserved:** no identifier allocation purchase; no production label printing; no assertion that scanning alone is a verified receipt; no depot movement history on the public care link. This proposal addresses identifiers and scan workflows only.

| Validation item | State | Scope / evidence |
|---|---|---|
| Public documentation, standards, source and release-history review | EXECUTED as research only | Sources S01–S16; these observations are not product validation. |
| Local scanner, prototype, vendor account, live deployment, production label or network test | NOT RUN | No local or external product setup was performed. |
| Confirm uniqueness/reconciliation against the legacy sheet and steward-selected namespace | PROPOSED / NOT_RUN | Include leading zeros, invalid/duplicate historical values, retired crates and replacement labels. |
| Try actual printed readable text, 1D Code 128 and optional QR on the cooperative's available phone/scanners | PROPOSED / NOT_RUN | Test ordinary camera/reader path, 2D requirement, worn/dirty labels and offline readability; no labels were printed. |
| Verify shipment vs event behavior for partial receipt, repeated crate cycles, wrong depot and duplicate scans | PROPOSED / NOT_RUN | A scan is a candidate lookup; staff confirmation and unique event record must be separate. |
| If managers authorize offline queueing, test stale snapshot, concurrent depot edits, retry/idempotency, ordering and reconciliation after reconnect | PROPOSED / NOT_RUN | Must be tested before enabling queueing; vendor documentation alone does not prove suitability. |
| If QR is enabled, verify public access, care-only content, default/redirect changes, unknown route/404, URL change, outage and no query/history leakage | PROPOSED / NOT_RUN | Web owner owns review and redirect policy; disable/omit the optional QR if this cannot be maintained. |
| If adopting GS1 syntax, test GRAI/AI 8003 and supported decoding with a pinned standards/parser version | PROPOSED / NOT_RUN | No allocation, GS1-conformant label, resolver or parser was configured. |

The next decision should be the namespace and whether offline events are allowed, followed by a limited validation plan. Neither owner decision excuses answering the public-source questions already covered here.
