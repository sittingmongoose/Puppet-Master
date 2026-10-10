# Independent discovery — returnable crate receiving labels

Stage: A5-02-treatment / investigator. Discovery is based only on the assigned complete brief and public primary sources listed by stable source ID in [sources/index.md](sources/index.md). I have not sought or read the exact plan. Access timestamp below is the UTC clock value observed immediately after the retrieval batch; the web retrieval tool does not expose per-page fetch timestamps.

## Recommendation and pilot shape

Keep one durable cooperative-controlled crate identifier visible as plain text and machine-readable in a simple 1D barcode. Preserve the legacy separation between crate identity and shipments. Use a receipt/return event as a new record that points to the crate and, when known, the shipment; make the staff member choose and confirm the event. A scan should resolve an identity or prefill a form, never itself certify a receipt. This is a planning recommendation inferred from the brief and the workflow evidence, not a tested product configuration.

For only three depots, pilot the existing spreadsheet or a small existing application with a uniqueness-checked crate registry plus an append-only movement/receipt-event table before adopting a full inventory product. Do not buy an identifier allocation or printing system for the pilot. If a software product is selected later, compare a shipment-oriented receipt flow (Odoo Inventory Barcode) with an asset-oriented register (Snipe-IT); neither public source establishes the cooperative's offline-queue requirement.

## Obligation 1 — compare workflows, alternatives, readers

| Approach | Supported path observed | Fit and tradeoff for this pilot |
| --- | --- | --- |
| Odoo 18.0 Inventory Barcode — shipment/operation first [O01–O04] | Enable Barcode; choose a scheduled receipt/picking; scan its products or package; explicitly Validate. A generic Receipts command creates a new receipt instead of matching a scheduled one. Custom internal barcode strings are supported. | Strong reference for shipment processing and explicit validation. Keep crate ID separate from shipment reference; do not use the generic receipt command when staff intend to process a scheduled shipment. Documentation describes real-time server workflow and does not establish an offline queue. |
| Snipe-IT asset labels — asset first [S01–S07] | Each asset has a unique asset tag; label may contain a 1D barcode for tag search and a 2D QR link to the asset page. Standard USB/Bluetooth scanners are described. Check-in/out and action history provide an asset lifecycle analogue. | Closer to reusable crate identity than a shipment-only flow. It is a general asset manager rather than a crate-receiving product; docs allow location checkout but discourage treating a location as an accountable person. The QR opens the internal asset page, not the requested public care page. Current v8.8.0 release calls the official mobile app and sync adapters beta, and its release says docs are still being updated. Verify the exact deployed release and permissions before selection. |
| Normalized existing sheet + generic reader (inference) | Keep one crate registry and append movement records; accept scanner keystrokes or manual text entry. | Lowest-change pilot and no new allocation or app purchase. Uniqueness, simultaneous edits, audit, and offline conflict handling must be supplied by the chosen sheet/process; none was tested here. |
| GS1 Digital Link as an analogous identifier/resolver, not an internal ID proposal [G01–G04, Z01–Z04] | A standards-shaped URI contains GS1 identifiers; software can parse those keys without online lookup, while a generic camera can follow the URI as a web link. A resolver can redirect the persistent URI to changeable information. | Useful separation of physical identity from web destination. Its keys and allocation rules do not establish a cooperative crate namespace. Do not buy GS1 identifiers for this pilot or encode the shipment number as crate identity. |

A low-cost, offline-capable staff path is a human-readable internal ID plus a 1D scanner that types into a focused field; when the scanner or app is unavailable, staff can transcribe the same text. Odoo 18.0 docs treat some scanners as USB keyboards and call out keyboard-layout/terminator issues [O06]; compatibility must be checked with the selected host, language, scanner, and application. The reader can decode locally while offline, but recording the resulting business event is a separate application capability. Camera/2D QR scanning is useful for the optional web page, while retrieving that page requires a network. There is no current product evidence here that a camera or low-cost scanner queues a depot event offline. No scanner prices were checked, so “low cost” is a relative pilot design judgment, not a price comparison.

## Obligation 2 — keep four identities distinct

- **Crate identity (crate_id)**: one durable key for one physical reusable crate for its whole life; unique across all three depots and never reassigned to another crate.
- **Shipment identity (shipment_id)**: one transport/dispatch record, potentially containing many crates. Store as a separate foreign key/field. It cannot silently replace or mutate crate_id.
- **Product identity (product_id/SKU)**: a catalog item or contents type, if the cooperative needs it. It is not the reusable container and not a shipment. A particular crate can carry different products over time.
- **Receipt/movement event identity (event_id)**: a unique key for each attempted/accepted receipt, return, transfer, damage report, or correction, linked to crate, depot, time, actor, and optional shipment. The same crate may have many events; a repeated scan must not create a duplicate accepted event.

This four-way model is a local design inference. It preserves the legacy sheet's separation and supports an audit trail instead of overwriting “current depot” as the only history. If offline entry is approved, generate a unique event key before queueing and make replay idempotent; record pending/synced/conflict state. These are proposals, not existing capabilities.

## Obligation 3 — optional QR, decoding, redirects, replacement

Retain the QR-to-public-care-page option as optional scope. Recommend enabling it only after the web owner approves a stable HTTPS URL, public content, redirect ownership, and a check that neither page nor URL reveals crate movement history. A generic page about crate care is the safest pilot default; there is no need to publish a per-crate movement feed. Keep staff identity in its own readable 1D code and text. A QR that directly encodes a stable care URL needs no GS1 allocation. If the URL may move, print a cooperative-controlled stable route and let the web owner redirect it to the current page; if the printed destination is a direct page URL with no redirect, moving that page may require reprinting labels.

Decoding paths are different: a keyboard-wedge 1D scanner can enter the internal identifier into the staff form; staff can type the visible identifier; a phone camera or 2D reader can decode a QR URL. Local decoding does not fetch the public page or create a receipt. A GS1 Digital Link QR has an additional standard parsing path for GS1 identifiers, but that path is not established for a locally selected crate namespace. If the cooperative later adopts an externally assigned GS1 identifier, verify the selected decoder's symbology metadata and parser version; do not assume any QR decoder supports GS1 application-identifier semantics.

Replace a damaged label by reprinting the same immutable crate ID and, if used, the same stable care route. Record a label-replacement event and remove/void the damaged label; do not create a second crate or change its ID solely because adhesive or print is damaged. If the ID cannot be read, use a verified registry lookup and a manual confirmation path. These are proposed procedures.

## Obligation 4 — version behavior and migration risk

A direct recent example is Snipe-IT's QR setting migration. Issue #19515, reported on Snipe-IT v8.7.1, says switching to the New Label Engine left legacy QR Code Text invisible/not transferred and blank output could result. PR #19633 changed the settings transition to copy the old qr_text into label2_title once when enabling the new engine (commit c1d1cd1, merged 2026-09-17); Snipe-IT v8.8.0 (tag commit 2c466fa, released 2026-09-30) lists that fix. This is a configuration-migration bug in a specific product/version path, not a general QR defect. Its lesson is to test the actual saved label settings and decode generated sample output after engine/template migration. Snipe's rolling Asset Tags docs also say changing zero-fill length does not rewrite existing tags [S01], another reason to freeze an ID grammar during a pilot and plan a migration map before changing one.

A second, narrowly applicable parser example is ZXing: PR #1681 (commit 557b5fc, milestone 3.5.3) updated GS1 Application Identifier lengths per the 2023 spec. The author says length increases were accepted while decreases/removed AIs were left as-is for backward compatibility. ZXing 3.5.3 (tag commit f0f1a94) lists this update. PR #1839 (commit 34588d8) fixes QRCodeMultiReader dropping SYMBOLOGY_IDENTIFIER metadata needed by some code to recognize GS1 QR payloads (including ]Q3); ZXing 3.5.4 (tag commit f651b0a) lists the fix. These matter only if the eventual system uses these ZXing paths and relies on GS1 parsing/metadata. They do not show that this cooperative needs GS1, that every scanner returns this metadata, or that scanning a QR records a receipt. Keep a 1D internal identifier path independent of optional GS1 decoding.

## Obligation 5 — preserve the authorized optional care-link scope

Recommendation: retain a public care QR as an authorized option, not as a required pilot feature. Enable it if the web owner can keep a stable cooperative URL and approve its redirect target/content, and if tests show the public endpoint discloses only care instructions. If those conditions are not ready, document “deferred pending owner/web readiness”; do not reject the option as technically impossible. No public crate-care URL or resolver already exists in the available inputs, so capability is UNKNOWN pending owner confirmation.

## Obligations 6–7 — owner decisions and negative constraints

| Owner / constraint | Decision or rule to carry forward |
| --- | --- |
| Inventory steward | Chooses the internal crate-ID namespace/format and uniqueness controls. Recommendation: cooperative-controlled, unique, stable across depots, readable aloud, independent of shipment and product keys. Exact syntax remains steward-owned. |
| Depot managers | Decide whether scan events may queue offline. If yes, specify device custody, who may submit, reliable timestamping, replay/idempotency, duplicate/conflict resolution, and eventual sync acknowledgement. If no, approve the manual/paper fallback. |
| Web owner | Governs any resolver/redirect path and target changes. Approve a stable cooperative domain path and public-care-only content; test old labels through redirects. |
| All owners | A shipment number never overwrites crate identity. Scans may prefill a receipt, but only an explicit staff action records a receipt event. |
| Negative constraints | Do not buy identifier allocations, print production labels, claim any QR scan is a verified receipt, or publish depot movement history through the public care link. Research does not authorize accounts, purchases, production access, or writes. |

## Obligation 8 — validation priorities and execution boundary

| Check | Status | Proposed evidence/acceptance |
| --- | --- | --- |
| Public-source review and version/history research | EXECUTED as research only; not product validation. IDs and locators are in sources/index.md. | Direct primary documentation, standards, release pages, issue/PR and source diffs reviewed. No local product configured or tested. |
| Registry identity and uniqueness | PROPOSED / NOT_RUN | Two depots create distinct crates; duplicate and retired IDs rejected; shipment/product IDs cannot overwrite crate_id. |
| Receipt proof and event identity | PROPOSED / NOT_RUN | A scan only populates identity; explicit confirm creates one event_id. Repeat submission/replay is idempotent; shipment links correctly to multiple crates. |
| Offline behavior | PROPOSED / NOT_RUN; owner decision required first | Disconnect before scan, during entry, and during sync; verify durable queued events, visible pending state, timestamps, conflicts, and no duplicate on replay—or test the approved paper/manual procedure. |
| Readers and encoding | PROPOSED / NOT_RUN | Validate printed 1D format, text/transcription, keyboard layout and terminator on one inexpensive candidate scanner; check 2D QR with common phone/reader and confirm camera scan does not imply network reachability. |
| Label replacement | PROPOSED / NOT_RUN | Replace a damaged print with the same ID and care route; old label retired; repeated scan of new label resolves the same crate, not a new record. |
| Public QR/redirect privacy | PROPOSED / NOT_RUN; web-owner decision required | Follow the printed link before/after a redirect change; verify content is care-only, movement history is absent, HTTPS is used, no unapproved analytics or open redirect is introduced, and offline scan does not claim to have fetched/verified the page. |
| Parser/version migration | PROPOSED / NOT_RUN | Only if GS1 parsing or a label engine is selected: pin deployed library/version; test known valid and invalid payloads, standard symbology metadata, old/new length cases, migration of QR settings, and generated image output. |

No local discriminating test was run, no code was executed, and no label was generated. Sources, examples, and proposed validations are not reported as executed product checks.

## Native Goal receipt observed before discovery

The native Goal tool returned an active Goal and get_goal confirmed it. Exact objective used was the frozen objective in freeze.json. Directly observed creation fields: threadId 01a12432-6b24-7343-91e4-d980326cf868; status active; tokensUsed 0; timeUsedSeconds 0; createdAt 1791608689; updatedAt 1791608689. These are the initial observation, not terminal values. Provider/build provenance and terminal timestamp are UNKNOWN until directly exposed. The objective is below 4,000 characters.
