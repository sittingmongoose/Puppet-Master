# Evidence index — A5-02-control reviser

This is a bounded paraphrase index for research, not a product-validation report. Stable IDs S01–S17 are carried unchanged from the investigator source map. Exact URLs, released versions/commits, locators, original access UTC, retrieval operations, observed behavior, conditions, applicability, and critic rechecks are recorded in [source-map.json](../source-map.json). Findings cite these stable IDs from [final.md](../final.md).

## Asset labels and migration

- <a id="s01"></a>[S01 — Snipe-IT Asset Tags](https://snipe-it.readme.io/docs/asset-tags) · Live docs: system-unique asset tags; auto-increment/prefix settings have caveats.
- <a id="s02"></a>[S02 — Snipe-IT Asset Labels and Barcodes](https://snipe-it.readme.io/docs/asset-labels) · Separate 1D search and QR-to-asset paths; the QR needs the host reachable.
- <a id="s03"></a>[S03 — Snipe-IT Managing Assets](https://snipe-it.readme.io/docs/managing-assets) · Check-in/out model; manual discourages location as checkout target.
- <a id="s04"></a>[S04 — Issue #19515](https://github.com/grokability/snipe-it/issues/19515) · Reported on v8.7.1 during the legacy/new label-engine migration.
- <a id="s05"></a>[S05 — PR #19633](https://github.com/grokability/snipe-it/pull/19633) · One-time transfer of legacy QR text into the new engine; merged to develop, release-tag ancestry unverified.
- <a id="s06"></a>[S06 — Snipe-IT v8.8.0](https://github.com/grokability/snipe-it/releases/tag/v8.8.0) · Tag commit 2c466fa; existence/date do not prove inclusion of PR #19633.
- <a id="s17"></a>[S17 — Barcodes manual v8.3.6](https://snipe-it.readme.io/v8.3.6/docs/barcodes) · Versioned URL/cache and 1D-format instructions; do not generalize to later releases without checking.

## Receiving, offline, and scanning workflows

- <a id="s07"></a>[S07 — Odoo 18 barcode receipts](https://www.odoo.com/documentation/18.0/applications/inventory_and_mrp/barcode/operations/receipts_deliveries.html) · Versioned docs describe real-time scan/validate workflow; direct English page opens timed out, so full page context is not claimed.
- <a id="s08"></a>[S08 — Odoo 18 operation types](https://www.odoo.com/documentation/18.0/applications/inventory_and_mrp/barcode/setup/operation_types.html) · WHIN creates a new receipt; scheduled picking uses its specific reference.
- <a id="s09"></a>[S09 — Odoo 18 packages vs. packaging](https://www.odoo.com/documentation/18.0/applications/inventory_and_mrp/inventory/product_management/configure.html) · Individual reusable physical packages versus type/quantity product packaging.
- <a id="s10"></a>[S10 — Sortly offline mode](https://help.sortly.com/can-i-use-sortly-in-offline-mode) · Mobile-only snapshot edits with manual sync; not proof of an event queue.
- <a id="s11"></a>[S11 — Sortly scanner options](https://help.sortly.com/what-kind-of-scanners-can-i-use-with-sortly) · Phone-camera path and QR/2D versus 1D constraint; plan/hardware conditions apply.

## Identifier, URI, resolver, and parser evidence

- <a id="s12"></a>[S12 — GS1 General Specifications 26.0, GRAI](https://gs1za.org/wp-content/uploads/2026/04/GS1_General_Specifications_2026.pdf) · §2.3.1, printed p. 141; returnable-asset semantics. The mirror URL remains the stable source identity; the official index cross-check is documented in the source map.
- <a id="s13"></a>[S13 — Digital Link URI Syntax 1.7.0](https://ref.gs1.org/standards/digital-link/uri-syntax/1.7.0/) · GRAI AI 8003 and URL/decoder path; conformance recognition is a separate step.
- <a id="s14"></a>[S14 — GS1-Conformant Resolver Standard 1.2.1](https://ref.gs1.org/standards/resolver/) · §§2.2, 2.5.8–2.6, 2.12 and change log. Independent recheck: §2.12 requires full query-string transmission by default on redirect; the v1.2.0 change-log subsection removes the omit option. Captured between 2026-10-10 05:36:00 and 05:36:28 UTC. Requested unavailable link type returns 404. No resolver was operated.
- <a id="s15"></a>[S15 — GS1 Syntax Engine 1.4.1](https://github.com/gs1/gs1-syntax-engine/releases/tag/1.4.1) · Commit ec595ff; long URI-stem overflow fix; not installed or run.
- <a id="s16"></a>[S16 — GS1 System Architecture](https://ref.gs1.org/architecture/system-architecture/) · General smartphone/browser/decoder and later HTTP(S) resolver steps; live page without immutable version.

## Evidence boundary

Odoo English-page timeouts and the GS1 General Specifications page size limitation remain explicit in the source map. Primary-source retrieval and reading are research only. No product, scanner, label, resolver, parser, account, or live service was operated. Source IDs are not reassigned if later evidence differs; add a new source ID for a genuinely new source/version.
