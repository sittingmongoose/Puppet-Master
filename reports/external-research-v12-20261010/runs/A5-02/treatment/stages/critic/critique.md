# Independent critic review — returnable crate receiving labels

Stage: A5-02-treatment / critic. This is a critique of the investigator package, not a replacement or repaired proposal.

## Conclusion

The investigator package substantially satisfies the complete brief and correctly rejects the released plan's unsafe or unsupported assumptions. I found no material-wrong, materially incomplete, or unsupported consequential product claim, and no material false correction. It preserves the public crate-care QR as an authorized optional path, leaves owner decisions open, and retains all negative constraints. Recommendations, inferences, and proposed checks are distinguished from observed external behavior.

The key corrections are supported: crate identity remains separate from shipment; a scan resolves/prefills rather than proving a receipt; QR decoding, fetching a page, and recording an event are separate operations; and migration history is bounded to named versions and code paths.

No product was configured, no label was generated, no code was run, and no local product validation was performed during this review. Public-source inspection is research, not product validation.

## Findings by required class

| Class | Result |
| --- | --- |
| Material wrong | None found. |
| Material incomplete | None found against the brief's eight obligations or the released plan's complete scope. |
| Unsupported | None among consequential external behavior claims checked. Proposals and inferences are labeled. |
| Minor locator/wording | None requiring correction. Source IDs, URLs, versions/commits, locators, conditions, applicability, and access batches are recorded. |
| Honestly unresolved external input | The local facts below remain open; the investigator correctly does not claim public sources settle them. |

## Brief obligation review

| Obligation | Investigator locator | Assessment and evidence |
| --- | --- | --- |
| 1. Compare two workflows and an analogous resolver, including offline and low-cost scanner tradeoffs | Draft: “Workflow comparison and alternatives”; “Offline and low-cost scanner tradeoffs.” Discovery: “Obligation 1.” | Adequate. Odoo is bounded as shipment/operation-first; Snipe-IT as asset-label/custody analogue; the normalized sheet as an inference; GS1 Digital Link as analogy, not the cooperative namespace. The draft separates local decode, network retrieval, and event recording and states that prices were not checked. Odoo 18.0 confirms receipt selection/validation, the generic WHIN behavior, and configuration-specific scanner issues [C01–C03]. Snipe label docs confirm the 1D tag search and 2D in-system QR, subject to barcode enablement [C04]. |
| 2. Distinguish crate, shipment, product, and receipt-event identity | Draft: “Suggested record model.” Discovery: “Obligation 2.” | Adequate. Four records and relationships are explicit. The crate key remains stable; event identity represents an occurrence. Namespace choice remains steward-owned, and the model is clearly a proposal rather than a product schema. |
| 3. Research optional QR/resolver, decoding, redirection, and replacement | Draft: “QR, redirect, care page, and label replacement.” Discovery: “Obligation 3.” | Adequate. Staff ID and care QR are separate; local decode is not web retrieval or receipt confirmation; redirect ownership and same-ID replacement are addressed. GS1-specific offline parsing and redirect guidance are bounded to GS1 syntax [C09–C10]. |
| 4. Investigate migration/released behavior and applicability | Draft: “Version and migration evidence.” Discovery: “Obligation 4.” | Adequate and bounded. Snipe issue #19515 is a v8.7.1 label-engine transition report; PR #19633 transfers qr_text to label2_title on the new-engine enable transition; v8.8.0 lists the fix [C06–C08]. ZXing's AI-length and QRCodeMultiReader examples are limited to those GS1 parser paths and releases [Z01–Z04, C11–C12]. Neither implies that the cooperative uses those products. |
| 5. Preserve optional public crate-care QR | Draft: recommendation and plan clause 5. Discovery: “Obligation 5.” | Adequate. Optional and authorized, not mandatory or an established local capability. It is retained with conditions and deferred only pending web-owner readiness. |
| 6. Preserve owner authority and shipment/crate rule | Draft: plan clause 6 and “Owner decisions still open.” Discovery: “Obligations 6–7.” | Adequate. Inventory steward selects namespace, depot managers decide offline queue policy, web owner governs redirects; no decision is invented. Shipment ID cannot replace crate ID. |
| 7. Preserve negative constraints | Draft: plan clause 7 and validation boundary. Discovery: “Obligations 6–7.” | Adequate. No identifier allocation purchase, production label printing, scan-as-verified-receipt claim, or movement-history disclosure through the public care link. |
| 8. Complete evidence-backed proposal and validation boundary | Draft: all sections and “Validation status.” Discovery: “Obligation 8” and validation table. | Adequate. Alternatives, recommendations, source/version applicability, useful discoveries, owner inputs, and prioritized validation are present. Research is marked as research only; product checks remain proposed/NOT_RUN. |

## Released plan review

| Clause | Draft locator | Assessment |
| --- | --- | --- |
| 1. Compare workflows; draft plan reuses shipment number and treats every scan as receipt | “Exact plan clause disposition,” clause 1 | Correctly rejects both assumptions; Odoo's generic WHIN versus scheduled picking distinction supports the correction [C01–C02]. |
| 2. Four identities | Clause 2; “Suggested record model” | Complete; GS1 and Snipe-IT remain analogies, not selected authorities. |
| 3. QR/resolver; plan assumes every parser works offline | Clause 3; QR/replacement section | Correctly rejects universal parser/offline assumptions and separates paths. |
| 4. Migration; plan offers only visual sample inspection | Clause 4; migration section | Adds bounded release and code history; keeps visual review only as a proposed supplement. |
| 5. Optional care QR | Clause 5; recommendation | Retained with conditions; not made mandatory or excluded. |
| 6. Owner authority and crate/shipment separation | Clause 6; unresolved owner inputs | Preserved; decisions remain open. |
| 7. Negative constraints | Clause 7; validation boundary | All remain binding; proposed nonproduction checks do not contradict them. |
| 8. Complete proposal and validation | Clause 8; full draft | Supplied; evidence review is not mislabeled as product operation. |

## Honestly unresolved local facts

These are external inputs, not review defects: steward's exact namespace and symbology; depot managers' offline policy and actual queue/sync/idempotency/conflict behavior; spreadsheet/application uniqueness, audit, concurrency, permissions, and connectivity; actual reader/phone models, costs, layouts, terminators, print durability in crate/wash conditions; and whether a public care page or stable redirect exists and is approved. The draft names these unknowns and does not present them as settled by public documentation. Its relative cost statement is explicitly an inference, not a price comparison.

## Source and validation audit

I independently reviewed bounded primary sources linked from the carried source index. Odoo 18.0 supports the scoped receiving, generic WHIN, validation, and scanner descriptions [C01–C03]. Snipe-IT documentation supports the asset-label and accountability caveats [C04–C05]; its issue, code diff, and v8.8.0 release support the narrow migration history [C06–C08]. GS1 sources support the distinction between GS1 identifier parsing and content retrieval and bound the redirect advice to GS1 syntax [C09–C10]. ZXing PR, code, and release records support the named parser and metadata examples [C11–C12, Z02, Z04]. Full URLs, versions/commits, locators, conditions, applicability, and the batch access time are in this stage's source-map and index.

Frozen input hashes checked: brief a6520dffb1ba50fd341f287ae6805fe99e8f14f159c53eb87668029014ba3589; discovery ee307dbdb3efe66d060103d905f7567d70ace9eae9f8082f9da73dbe5fc714c0; draft 039a2996052529947313d1115877a66d5f0c8ddce2ec15f0efc8798a84197a51; plan reveal b4cf16e079bff1eb16228453f99f8682a63d34ecd99e0f53ca1463416111931e. The reveal-record hashes match the discovery and plan files.

Executed here: read-only review of frozen inputs and public primary-source retrieval. Not executed: product configuration, local prototype, code execution, label generation, scanner test, offline test, install, production access, or live write. All investigator validation proposals remain proposed.
