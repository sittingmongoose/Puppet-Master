# Independent primary evidence — A5-02 control v1

Return to [assessment](../assessment.md), [structured assessment](../assessment.json), or [source map](../source-map.json). E01–E19 are reviewer IDs; candidate S01–S17 remain original source identities. All observations are read-only research, not executed product validation.

<a id="e01"></a>
## E01 — candidate S01

[Governing primary source](https://snipe-it.readme.io/docs/asset-tags). Live documentation retrieved 2026-10-10; no deployed version established.

Locator: Asset Tags; Generate Auto-Incrementing IDs; Next auto-increment; Length of Asset Tags.

System uniqueness is correctly distinguished from a steward-selected local namespace.

Conditions: Auto-increment is optional; alphanumeric imports can distort numeric incrementing; changing tag length does not rewrite existing tags.

Saved evidence: [snipe-tag-md.txt](snipe-tag-md.txt), [web-retrieval-4.txt](web-retrieval-4.txt).

<a id="e02"></a>
## E02 — candidate S02

[Governing primary source](https://snipe-it.readme.io/docs/asset-labels). Live documentation; exact deployed release not selected.

Locator: Asset Labels: 1D search versus 2D asset-page QR; barcode enablement.

Supports the documented dual-path asset-label pattern. Host reachability applies to asset-page retrieval, not decoding.

Conditions: Barcode generation must be enabled. This describes an asset-page QR path, not every possible new-engine QR target. E18 shows configurable raw-value targets.

Saved evidence: [snipe-label-md.txt](snipe-label-md.txt), [web-retrieval-4.txt](web-retrieval-4.txt).

<a id="e03"></a>
## E03 — candidate S03

[Governing primary source](https://snipe-it.readme.io/docs/managing-assets). Live documentation.

Locator: Managing Assets > Best Practices > Checking out assets to non-people.

Location checkout is possible but discouraged for accountability; final correctly presents a workflow mismatch, not a prohibited capability.

Conditions: Guidance recommends an accountable person; it does not prove all depot custody designs are impossible.

Saved evidence: [web-retrieval-4.txt](web-retrieval-4.txt).

<a id="e04"></a>
## E04 — candidate S04

[Governing primary source](https://github.com/grokability/snipe-it/issues/19515). Reporter v8.7.1; opened 2026-08-18; closure 2026-09-23 referencing c1d1cd1.

Locator: Issue description, What happened?, version, linked PR and closure activity.

Confirms a legacy QR Code Text/new-engine title migration report. Discovery/source-map overreach about a missing encoded QR payload is not established by this report or the source. Final history narrows to the field/title migration.

Conditions: A user report, not independently executed reproduction. QR Code Text is a displayed-title setting in the inspected source; blank title is not proof of blank encoded URL.

Saved evidence: [web-retrieval-4.txt](web-retrieval-4.txt).

<a id="e05"></a>
## E05 — candidate S05

[Governing primary source](https://github.com/grokability/snipe-it/pull/19633). Head commit 1e0fc8c; merge c1d1cd1; develop merge 2026-09-17.

Locator: app/Http/Controllers/SettingsController.php postLabels; resources/views/partials/labels-new-engine.blade.php removed fallback help.

The actual source copies qr_text into label2_title on a legacy-to-new enable transition. The final describes that bounded operation accurately.

Conditions: Conditional !$wasLabel2Enabled && request boolean label2_enable; not each render or arbitrary scanner parsing. Original maps call the field qr_code_text, but the source property is qr_text.

Saved evidence: [snipe-pr-diff.txt](snipe-pr-diff.txt), [snipe-pr-api.txt](snipe-pr-api.txt), [web-retrieval-5.txt](web-retrieval-5.txt).

<a id="e06"></a>
## E06 — candidate S06

[Governing primary source](https://github.com/grokability/snipe-it/releases/tag/v8.8.0). v8.8.0 / 2c466fa; published 2026-09-30.

Locator: Release header and What's Changed entry linking #19515/#19633.

Release existence/date are confirmed. Release notes explicitly include #19633; candidate did not verify ancestry and correctly did not assert inclusion as a proven tested deployment fact.

Conditions: Independent review establishes the released-note linkage, not an operated deployment. No Git ancestry command was run. This limited open historical check is not needed for the local-ID recommendation.

Saved evidence: [snipe-release-api.txt](snipe-release-api.txt), [web-retrieval-5.txt](web-retrieval-5.txt).

<a id="e07"></a>
## E07 — candidate S07

[Governing primary source](https://www.odoo.com/documentation/18.0/applications/inventory_and_mrp/barcode/operations/receipts_deliveries.html). Odoo documentation branch 18.0; independent official repository RST retrieved.

Locator: Enable Barcode app; Scan barcodes for receipts; Validating the transfer.

Confirms real-time receipt operations, selecting the outstanding receipt, scanning product/packaging and explicit validation. Documentation review is not a receipt run.

Conditions: Barcode feature/app enablement is necessary. Default Nomenclature and Default GS1 Nomenclature differ; UPC/EAN conversion is described. No offline queue guarantee is given. Public-page timeout was resolved for this review via official 18.0 documentation source.

Saved evidence: [odoo-receipts-rst.txt](odoo-receipts-rst.txt), [web-retrieval-3.txt](web-retrieval-3.txt).

<a id="e08"></a>
## E08 — candidate S08

[Governing primary source](https://www.odoo.com/documentation/18.0/applications/inventory_and_mrp/barcode/setup/operation_types.html). Official Odoo 18.0 documentation source.

Locator: Use barcodes > Operations > WHIN warning; Commands > VALIDATE / PRINT PICKING OPERATION.

WHIN starts a new receipt order; a particular picking reference finds a scheduled operation. Supports separating command/operation from physical-crate and local event identity.

Conditions: Generic WHIN does not match a scheduled receipt even with equal contents. VALIDATE can itself be invoked by a command barcode; the local staff-confirmation choice is not a claim that Odoo requires only a screen click.

Saved evidence: [odoo-operations-rst.txt](odoo-operations-rst.txt), [web-retrieval-6.txt](web-retrieval-6.txt).

<a id="e09"></a>
## E09 — candidate S09

[Governing primary source](https://www.odoo.com/documentation/18.0/applications/inventory_and_mrp/inventory/product_management/configure.html). Official Odoo 18.0 documentation source.

Locator: Comparison: Packages versus Packaging; unique codes, inventory tracking, reusability, Smooth barcode operations.

Individual physical packages and repeated type/quantity packaging are correctly distinguished. Closest researched fit is labeled inference, not proven depot suitability.

Conditions: Package reception may require both package and individual-item scans. Move Entire Packages affects contents locations. Package Use context/default restrictions are in E19; product lot/serial tracking is not a crate instance ID.

Saved evidence: [odoo-configure-rst.txt](odoo-configure-rst.txt), [web-retrieval-6.txt](web-retrieval-6.txt).

<a id="e10"></a>
## E10 — candidate S10

[Governing primary source](https://help.sortly.com/can-i-use-sortly-in-offline-mode). Live vendor help, 2026-10-10; app build not selected.

Locator: How to Enable Offline Mode; FAQ snapshot and sync behavior.

Mobile-only disable-sync inventory edits and later synchronization are confirmed. Final does not promote this to a verified receipt-event queue.

Conditions: Android/iOS only; web not offline. Disable Sync leaves a device snapshot; vendor advises full sync first. Conflict ordering/idempotency across depots are not established.

Saved evidence: [web-retrieval-1.txt](web-retrieval-1.txt), [web-retrieval-2.txt](web-retrieval-2.txt).

<a id="e11"></a>
## E11 — candidate S11

[Governing primary source](https://help.sortly.com/what-kind-of-scanners-can-i-use-with-sortly). Live vendor help; no app build or hardware selected.

Locator: Mobile App; web limits; FAQ Bluetooth plans, 1D/QR, smart-scanner camera and Android version.

Phone camera is a no-extra-reader route; QR needs 2D capability; web scan check-in/out is unsupported. Low-cost argument is qualitative, not a price/free-tier promise.

Conditions: Bluetooth integration requires Ultra/Premium/Enterprise; tested hardware differs from unguaranteed alternatives. Smart scanner uses app camera by default and requires Android 12+. Final defers actual hardware suitability to a proposed check.

Saved evidence: [web-retrieval-4.txt](web-retrieval-4.txt).

<a id="e12"></a>
## E12 — candidate S12

[Governing primary source](https://ref.gs1.org/standards/genspecs/26.0.0/). GS1 General Specifications release 26.0, ratified January 2026.

Locator: §2.3 and §2.3.1; physical/printed pages 140–142; header and footers visually inspected.

Confirms crates, issuing Company Prefix, asset type plus optional individual serial, and prohibition on treating carried goods as AI 8003 assets.

Conditions: For individual crate tracking, type alone is insufficient; serial distinguishes instances. In open environments, Digital Link QR/Data Matrix are additional to the listed GS1 carriers; p142 gives symbol-quality and multiple-carrier conditions. Final selects no GS1 label/deployment and disclaims GS1 conformity for the pilot. Original S12 mirror identity is preserved separately, not rebound.

Saved evidence: [gs1-genspecs-26.pdf](gs1-genspecs-26.pdf), [gs1-genspecs-26.txt](gs1-genspecs-26.txt), [gs1-genspecs-26-header.txt](gs1-genspecs-26-header.txt).

<a id="e13"></a>
## E13 — candidate S13

[Governing primary source](https://ref.gs1.org/standards/digital-link/uri-syntax/1.7.0/). Release 1.7.0, ratified August 2026.

Locator: Header confirms Release 1.7.0, Ratified Aug 2026; §2 conformance; §4.3–4.5 primary keys/value grammar; §6.1 recognition; GRAI AI 8003.

URL-shaped Digital Link can be treated as an ordinary URL; syntactic recognition and receiving-application validation are separate.

Conditions: GRAI value is 13 digits plus optional 1–16-character serial under the defined character set; GTIN serial AI 21 has different grammar. Domain/stem and compressed/uncompressed processing matter. No concrete GS1 URI is proposed as an implemented crate label.

Saved evidence: [web-retrieval-7.txt](web-retrieval-7.txt), [web-retrieval-8.txt](web-retrieval-8.txt), [web-retrieval-10.txt](web-retrieval-10.txt).

<a id="e14"></a>
## E14 — candidate S14

[Governing primary source](https://ref.gs1.org/standards/resolver/). Release 1.2.1, ratified August 2026.

Locator: §§1.1,2.1,2.2,2.5.10,2.6.2,2.12; conformance §5 item 19; change log §§9.2–9.3.

C-01 substance is correct: query pass-through is required on redirect. Final fixes the change-log version locator to 1.2.0; 1.2.1 corrects GTIN-hierarchy serial AI 17 to 21.

Conditions: Missing requested link type gives 404; selection among multiple matching links may give 300 and default linkset is an optional mode. Resolver may support a subset of primary keys, so future GRAI support is a selection check. General one-to-one redirect needs no specialized resolver. Full query transmission applies when redirecting, not to offline decode or every generic web service.

Saved evidence: [web-retrieval-2.txt](web-retrieval-2.txt), [web-retrieval-8.txt](web-retrieval-8.txt), [web-retrieval-9.txt](web-retrieval-9.txt).

<a id="e15"></a>
## E15 — candidate S15

[Governing primary source](https://github.com/gs1/gs1-syntax-engine/releases/tag/1.4.1). 1.4.1 / ec595ff; release May 28, 2026.

Locator: Release notes; official 1.4.1 README architecture/bindings.

Very-long-Digital-Link-stem overflow fix is real versioned parser history. It is not a general hardware scanner fault.

Conditions: C native library with C++ wrapper and other bindings. Not installed or executed. Short URL recommendation is a local practical choice; shortness is not a proof of parser security or resolver conformity.

Saved evidence: [web-retrieval-7.txt](web-retrieval-7.txt), [gs1-engine-readme.txt](gs1-engine-readme.txt), [gs1-engine-release-api.json](gs1-engine-release-api.json), [release retrieval metadata](gs1-engine-release-retrieval.json).

<a id="e16"></a>
## E16 — candidate S16

[Governing primary source](https://ref.gs1.org/architecture/system-architecture/). Live official architecture page; immutable edition not established.

Locator: 2D Symbol (GS1 Digital Link URI) Specific Workflow; smartphone paths then HTTP(S) services.

Supports separation of decoding, URI recognition and web retrieval. Generic care-page QR is a local design, not an existing cooperative service.

Conditions: Native camera/browser/generic/dedicated apps are potential paths; actual device support needs verification. These pages do not make any scan a confirmed receipt.

Saved evidence: [web-retrieval-7.txt](web-retrieval-7.txt).

<a id="e17"></a>
## E17 — candidate S17

[Governing primary source](https://snipe-it.readme.io/v8.3.6/docs/barcodes). Explicit v8.3.6 documentation; not a tested later release.

Locator: Supported 1D Barcodes; QR Codes; Changing your URL.

Supports Code 128 for ASCII/alphanumeric IDs and the historical APP_URL/cache regeneration workflow. Final correctly bounds that behavior to the cited version.

Conditions: Symbology must match tag characters/length. Changing APP_URL plus regenerating images does not change already printed labels. Direct URL versus stable redirect remains a local choice; no cache-clearing command was executed.

Saved evidence: [snipe-barcode-md.txt](snipe-barcode-md.txt).

<a id="e18"></a>
## E18 — candidate independent extension

[Governing primary source](https://raw.githubusercontent.com/grokability/snipe-it/1e0fc8c/app/View/Label.php). Pinned Snipe-IT head commit 1e0fc8c.

Locator: render: title data block versus barcode2d target switch; DefaultLabel.php title/barcode rendering blocks.

Independent source evidence distinguishes displayed label title from encoded QR content. It also exposes raw asset-tag/ID targets as a possible offline decoding opportunity.

Conditions: 2D output depends on template support/type and label2_2d_target, not label2_title. hardware_id is the default switch path, while plain_asset_tag and other targets exist. No PHP, label generator or scanner was run. This extra opportunity is not a new mandatory obligation or evidence of public-care customization.

Saved evidence: [snipe-label-view.txt](snipe-label-view.txt), [snipe-label-view-retrieval.json](snipe-label-view-retrieval.json), [snipe-default-label.txt](snipe-default-label.txt).

<a id="e19"></a>
## E19 — candidate independent extension

[Governing primary source](https://raw.githubusercontent.com/odoo/documentation/18.0/content/applications/inventory_and_mrp/inventory/product_management/configure/package.rst). Official Odoo documentation 18.0.

Locator: Package Use introduction; Cluster packages.

Expands E09 to the actual default/context: the reusable selector is a cluster-picking setting. Final makes only a conditional package-model comparison.

Conditions: Package Use becomes visible with Packages and Batch Transfers; default is Disposable Box; change to Reusable Box only for cluster picking. This is not an independently demonstrated inter-depot reusable-crate lifecycle.

Saved evidence: [odoo-packages-rst.txt](odoo-packages-rst.txt).

## Retrieval and integrity provenance

HTTP metadata: [initial/follow-up manifest](primary-http-manifest.json), [additional source manifest](followup-http-manifest.json), [pinned label-view retrieval](snipe-label-view-retrieval.json). The final URI-header recheck is in web-retrieval-10.txt; the engine release-date/API recheck is in gs1-engine-release-retrieval.json. Web snapshots record returned source URLs/locators. Access windows in the source map are conservative review intervals; exact HTTP times are in these manifests.

The first generic HTTP extraction mistakenly treated the official PDF response as text. It was not used for semantic judgment; the manifest marks that extraction invalid, and the successful PDF plus pdftotext/visual check replaced it. No frozen candidate bytes were changed.

Raw source SHA-256 values and all saved evidence hashes are in the source map. These establish identity, not source correctness. The assessment explains semantic applicability separately.
