# Source index — investigator discovery

Evidence retrieval date: 2026-10-10. The exact clock timestamp observed after the retrieval batch was 2026-10-10T05:10:31Z UTC. The web retrieval tool does not provide a per-page request timestamp; source records use this batch observation time. IDs are stable and are not to be reassigned. Summaries are paraphrases of bounded primary-source evidence; see [source-map.json](../source-map.json) for URL, version/commit, locator, condition, applicability, and access fields.

## Workflows and input identities

- [O01 — Odoo 18.0 receiving](https://www.odoo.com/documentation/18.0/applications/inventory_and_mrp/barcode/operations/receipts_deliveries.html): select a scheduled receipt, scan its contents, then validate. Real-time server workflow; no offline queue is established.
- [O02 — Odoo operation commands](https://www.odoo.com/documentation/18.0/applications/inventory_and_mrp/barcode/setup/operation_types.html): generic WHIN makes a new receipt; use a specific picking barcode for a scheduled receipt.
- [O03 — Odoo internal values and GTIN](https://www.odoo.com/documentation/18.0/applications/inventory_and_mrp/barcode/setup/software.html): arbitrary internal barcode strings are supported; new GTIN creation requires GS1 Company Prefix; lookup is opt-in.
- [O04 — Odoo optional lot/serial scan](https://www.odoo.com/documentation/18.0/applications/inventory_and_mrp/barcode/setup/serial_numbers_lots.html): scan can be optional by operation type and manual typing is a fallback for damaged supplier labels.
- [O05 — Odoo nomenclature rules](https://www.odoo.com/documentation/18.0/applications/inventory_and_mrp/barcode/operations/barcode_nomenclature.html): first matching prefix/length rule controls barcode interpretation.
- [O06 — Odoo scanner keyboard behavior](https://www.odoo.com/documentation/18.0/applications/general/iot/devices/printer.html): USB keyboard layout, scanner configuration, and mobile per-character behavior can affect input.
- [S01 — Snipe-IT asset tags](https://snipe-it.readme.io/docs/asset-tags): unique asset tag; prefix/zero-fill; changing length does not rewrite existing tags.
- [S02 — Snipe-IT labels](https://snipe-it.readme.io/docs/asset-labels): 1D tag-search barcode plus optional 2D QR to asset page; USB/Bluetooth scanner path is documented.
- [S03 — Snipe-IT import identity fields](https://snipe-it.readme.io/docs/importing-assets): internal row ID, asset tag, and serial are separate inputs with different matching rules.
- [S04 — Snipe-IT v8.8.0 release](https://github.com/grokability/snipe-it/releases/tag/v8.8.0): release notes (2026-09-30, commit 2c466fa) include label-engine QR text fix and Zebra 1D template support; mobile app/sync adapters are beta.
- [S05 — Issue #19515](https://github.com/grokability/snipe-it/issues/19515): v8.7.1 report of QR text not transferred/visible when switching label engines.
- [S06 — PR #19633 source diff](https://github.com/grokability/snipe-it/pull/19633/files): code copies old qr_text into label2_title once when enabling New Label Engine; merged c1d1cd1.
- [S07 — PR #19679](https://github.com/grokability/snipe-it/pull/19679): adds 1D barcode to one Zebra 18939 label template; merged df2c3d8.

## Resolver and parser evidence

- [G01 — GS1 Digital Link Quick Start Guide (2024)](https://ref.gs1.org/docs/2024/digital-link-quick-start-guide): GS1 IDs can be parsed without online lookup; generic camera can follow the URL; the URI uses defined GS1 keys and qualifiers.
- [G02 — GS1 redirection guidance (2024)](https://ref.gs1.org/docs/2024/redirection-from-scan-to-content): separates persistent identity from destination, recommends 303 for redirects, and warns scan services can collect location/device analytics.
- [G03 — GS1 Resolver Standard 1.2.0](https://ref.gs1.org/standards/resolver/1.2.0/GS1_Conformant_Resolver_standard_i1.2-r-2026-01-19): resolver domains are independently controlled; conformant resolvers need not return identical targets/linksets.
- [G04 — GS1 General Specifications 23.0.0](https://ref.gs1.org/standards/genspecs/23.0.0/): ]Q3 identifies GS1 QR with leading FNC1.
- [Z01 — ZXing PR #1681](https://github.com/zxing/zxing/pull/1681): 2023 GS1 Application Identifier parser length update; backward compatibility retained for decreased/removed AIs; commit 557b5fc.
- [Z02 — ZXing 3.5.3 release](https://github.com/zxing/zxing/releases/tag/zxing-3.5.3): release includes PR #1681; tag commit f0f1a94.
- [Z03 — ZXing PR #1839](https://github.com/zxing/zxing/pull/1839): QRCodeMultiReader metadata preservation fix for GS1 QR marker; commit 34588d8.
- [Z04 — ZXing 3.5.4 release](https://github.com/zxing/zxing/releases/tag/zxing-3.5.4): release includes PR #1839; tag commit f651b0a.

## Evidence boundary

These sources are public primary documentation, standards, release notes, issue/PR histories, or code diff. They are not proof that the cooperative owns a resolver, supports offline sync, has a selected app/scanner, or has verified a printed label. Product checks remain proposed in discovery/draft unless a row explicitly says otherwise.

## Additional Snipe-IT workflow context (retrieved after release)

- [S08 — Snipe-IT Managing Assets](https://snipe-it.readme.io/docs/managing-assets): checkouts to locations are possible, but official guidance discourages assigning assets to non-people for accountability.
- [S09 — Snipe-IT Overview](https://snipe-it.readme.io/docs/overview): unique asset tags and check-in/out are its asset custody model; locations are an available but discouraged target.
