# Source index — independent critic review

Stage: A5-02-treatment / critic. Original investigator source IDs and records are preserved unchanged in [source-map.json](../source-map.json). Direct critic retrievals use C01–C12. The retrieval batch timestamp was observed immediately after the batch at 2026-10-10T05:21:15Z UTC; the web tool does not expose individual request times. Each record in the source map contains exact URL, version/commit, locator, access UTC, observed behavior, condition, and applicability.

## Odoo 18.0 workflow and scanner

- [C01 — Receipts and deliveries](https://www.odoo.com/documentation/18.0/applications/inventory_and_mrp/barcode/operations/receipts_deliveries.html): real-time receipt flow with selection and explicit validation.
- [C02 — Operation types and commands](https://www.odoo.com/documentation/18.0/applications/inventory_and_mrp/barcode/setup/operation_types.html): generic WHIN creates a new receipt; use a picking barcode for a scheduled receipt.
- [C03 — Scanner setup](https://www.odoo.com/documentation/18.0/applications/general/iot/devices/printer.html): keyboard layout, terminator, and mobile behavior vary by setup.

## Snipe-IT workflow and migration

- [C04 — Asset Labels](https://snipe-it.readme.io/docs/asset-labels): 1D asset-tag search plus 2D in-system QR.
- [C05 — Managing Assets](https://snipe-it.readme.io/docs/managing-assets): unique tags; location checkouts are possible but discouraged for accountability.
- [C06 — Issue #19515](https://github.com/grokability/snipe-it/issues/19515): v8.7.1 report of QR text during engine migration.
- [C07 — PR #19633 source diff](https://github.com/grokability/snipe-it/pull/19633/files): transition copies old QR text to the new title field.
- [C08 — v8.8.0 release](https://github.com/grokability/snipe-it/releases/tag/v8.8.0): includes migration fix and one Zebra 1D template change; mobile app and sync adapters are beta.

## Resolver and parser evidence

- [C09 — GS1 Digital Link Quick Start Guide](https://ref.gs1.org/docs/2024/digital-link-quick-start-guide): GS1 identifiers may be parsed offline; URL content retrieval is separate.
- [C10 — GS1 redirection guidance](https://ref.gs1.org/docs/2024/redirection-from-scan-to-content): GS1-specific redirect guidance and 303 recommendation.
- [C11 — ZXing PR #1681](https://github.com/zxing/zxing/pull/1681): AI-length compatibility note and 3.5.3 milestone.
- [C12 — ZXing commit 557b5fc](https://github.com/zxing/zxing/commit/557b5fc): code diff for the GS1 AI update.

The carried source map also retains the investigator's Z02 and Z04 release identities and all other O/S/G/Z IDs. These are evidence checks, not product validation.
