# Evidence index — A5-02-control investigator

This is a navigable paraphrase index, not a product-validation report. Stable source IDs are recorded in [source-map.json](../source-map.json); findings cite them from [discovery.md](../discovery.md). The source map records exact URLs, released versions/commits where known, locators, access UTC, retrieval operations, observed documented behavior, conditions, and applicability.

## Asset-label workflow

- <a id="s01"></a>[S01 — Snipe-IT Asset Tags](https://snipe-it.readme.io/docs/asset-tags): unique per-system asset tag, optional auto-increment; non-numeric tags and later length changes have caveats.
- <a id="s02"></a>[S02 — Snipe-IT Asset Labels](https://snipe-it.readme.io/docs/asset-labels): separate 1D scanner/search and QR-to-asset path; mobile reader and USB/Bluetooth scanner options.
- <a id="s03"></a>[S03 — Snipe-IT Managing Assets](https://snipe-it.readme.io/docs/managing-assets): check-in/out model; manual discourages checking assets out to locations.
- <a id="s04"></a>[S04 — Snipe-IT #19515](https://github.com/grokability/snipe-it/issues/19515): v8.7.1 QR field not carried from legacy label engine into new engine; closed after linked fix.
- <a id="s05"></a>[S05 — Snipe-IT PR #19633](https://github.com/grokability/snipe-it/pull/19633): source change copies legacy QR text into new label title once during migration; merged to develop Sep 17, 2026.
- <a id="s06"></a>[S06 — Snipe-IT v8.8.0](https://github.com/grokability/snipe-it/releases/tag/v8.8.0): release tag commit 2c466fa dated Sep 30, 2026. Ancestry of the fix commit was not checked.
- <a id="s17"></a>[S17 — Snipe-IT Barcodes manual, v8.3.6](https://snipe-it.readme.io/v8.3.6/docs/barcodes): legacy version documents 1D format constraints and regeneration of cached QR images after the system URL changes; verify before applying to a later tag.

## Receiving and scanner workflows

- <a id="s07"></a>[S07 — Odoo 18 Barcode receipts](https://www.odoo.com/documentation/18.0/applications/inventory_and_mrp/barcode/operations/receipts_deliveries.html): real-time barcode receipts and validation using operation and product/package scans.
- <a id="s08"></a>[S08 — Odoo 18 operation types](https://www.odoo.com/documentation/18.0/applications/inventory_and_mrp/barcode/setup/operation_types.html): a generic WHIN command creates a new receipt; a specific picking barcode opens the scheduled receipt.
- <a id="s09"></a>[S09 — Odoo 18 packages vs packaging](https://www.odoo.com/documentation/18.0/applications/inventory_and_mrp/inventory/product_management/configure.html): physical packages may have unique codes and reusable/disposable use; product packaging identifies fixed type/quantity.
- <a id="s10"></a>[S10 — Sortly offline mode](https://help.sortly.com/can-i-use-sortly-in-offline-mode): mobile-only, disable sync, local inventory-level updates and manual reconnect sync from a staleable snapshot.
- <a id="s11"></a>[S11 — Sortly scanner options](https://help.sortly.com/what-kind-of-scanners-can-i-use-with-sortly): phone-camera QR/barcode option; QR requires 2D capability; web scan limitations and plan conditions.

## Identifier/resolver and parsing evidence

- <a id="s12"></a>[S12 — GS1 General Specifications release 26.0, GRAI](https://gs1za.org/wp-content/uploads/2026/04/GS1_General_Specifications_2026.pdf): §2.3.1, printed p. 141. Returnable-asset key for crates; type plus optional serial; explicitly excludes the carried trade item. Search returned the full section; direct-open tooling was unavailable.
- <a id="s13"></a>[S13 — GS1 Digital Link URI Syntax 1.7.0](https://ref.gs1.org/standards/digital-link/uri-syntax/1.7.0/): ratified Aug 2026; AI 8003 identifies GRAI; QR payload is a URL usable by general phone scanning.
- <a id="s14"></a>[S14 — GS1-Conformant Resolver Standard 1.2.1](https://ref.gs1.org/standards/resolver/): ratified Aug 2026; default/requested redirect and 404 semantics; query forwarding; serial AI correction bounded to GTIN hierarchy.
- <a id="s15"></a>[S15 — GS1 Syntax Engine 1.4.1](https://github.com/gs1/gs1-syntax-engine/releases/tag/1.4.1): commit ec595ff; source project processes GS1 syntax, scanner data and Digital Link; release fixed very-long-stem overflow. Not run locally.
- <a id="s16"></a>[S16 — GS1 System Architecture](https://ref.gs1.org/architecture/system-architecture/): smartphone camera/browser/generic app decode paths and separate HTTP resolver step.

## Evidence boundary

All entries support research findings only. No app behavior was tested, no scanner was paired, no QR label was printed, no resolver was configured or called, and no future validation is reported as executed. Source IDs are not reassigned if later evidence differs; add a new ID and state the version/applicability difference.
