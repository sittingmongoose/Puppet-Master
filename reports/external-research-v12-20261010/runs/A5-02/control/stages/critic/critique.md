# Independent critic review — A5-02-control

Stage: critic. Scope: the complete assigned brief, the complete investigator `discovery.md`, `draft.md`, `source-map.json`, navigable `sources/index.md`, and the exact `revealed-plan.md`. This is a critique only; it does not revise the proposal or claim product validation.

## Review result

The investigator package is complete and materially faithful to both the original brief and the released plan. I found no material wrong claim, material omission, or materially unsupported recommendation. It corrects the plan's shipment-label/scan-equals-receipt assumptions, retains the authorized optional care-page QR on its own conditions, keeps all four identities separate, and does not turn any owner decision or validation proposal into an accomplished fact. The alternative workflows and standards analogy are evidence-linked and appropriately bounded.

### Findings

| ID | Classification | Locator and evidence | Assessment |
|---|---|---|---|
| C-01 | Minor locator/wording | `draft.md`, §3, paragraph beginning “If a future GS1 resolver is selected”; `source-map.json` S14, Resolver Standard §2.12 and change log §9.3. | The draft says query parameters are forwarded “by default.” Release 1.2.1 instead normatively requires forwarding all incoming `key=value` query pairs when redirecting; its change log says the earlier option to omit them was removed. The nearby instructions not to put staff/depot state or movement data in the public URI and the proposed no-leakage check substantially cover the risk. Clarify that pass-through is required for a conformant 1.2.1 resolver, so privacy depends on keeping sensitive values out of the URI and its query. This does not invalidate the shared, static care-URL recommendation. No resolver was configured or tested. |
| C-02 | Honestly unresolved external input (expected, not a defect) | `draft.md`, §6, owner decisions; `discovery.md`, “Owner decisions that remain explicit”; original brief obligations 5–6. | The inventory steward has not selected a namespace, depot managers have not decided whether offline scans may queue, and the web owner has not confirmed a maintainable public care route or redirect policy. The proposal identifies each owner and the consequence of each decision. These are correctly left open; they do not excuse the public research already completed. |

No item was classified as material wrong, material incomplete, or materially unsupported. The critique found no evidence-based reason to exclude the care-page QR; retaining it conditionally is the right disposition. The proposal also does not silently require it.

## Obligation and plan reconciliation

| Brief obligation | Investigator locator | Review outcome and evidence |
|---|---|---|
| 1. Compare two workflows and an analogous resolver mechanism, including offline and low-cost scanning | `draft.md` §1, candidate table and following paragraph | **Met.** Odoo 18 is a receiving/package workflow; Snipe-IT is an asset-label workflow; Sortly is a phone-first offline alternative; GS1 GRAI/Digital Link and resolver are the standards analogy. The proposal distinguishes phone-camera/2D QR from 1D scanning, and does not infer Odoo offline support from silence in its docs. Sources S01–S16. |
| 2. Keep crate, shipment, product and receipt-event identity distinct | `draft.md` §2 | **Met.** Durable `crate_id`, grouping `shipment_id`, optional cargo `product_id`, and unique event key are defined and related without substitution. The GRAI analogy is explicitly not made a cooperative namespace. Sources S09, S12. |
| 3. Research optional QR/resolver, decoding, redirection and replacement | `draft.md` §3 | **Met.** Readable/1D staff ID is separate from URL QR; phone/2D decoding is distinguished from network retrieval; default/requested links, unavailable-link response, redirect ownership and relabeling are covered. Source S14 has the C-01 precision point above. Sources S02, S11, S13–S17. |
| 4. Investigate a parsing/format migration or released behavior change | `draft.md` §4 | **Met.** Snipe-IT v8.7.1 label-engine migration report and PR fix are bounded to the migration path; whether it is in v8.8.0 is left unverified. Resolver 1.2.1's AI correction is bounded to GTIN hierarchy, and Syntax Engine 1.4.1's long-stem fix is not presented as a universal scanner defect. Sources S04–S06, S14–S15. |
| 5. Preserve and investigate optional public care-page QR | `draft.md` §1 and §3 | **Met.** Kept as authorized but optional; shared generic care URL is recommended only if web ownership, public reachability and privacy conditions hold. No unsupported capability or mandatory feature is asserted. Sources S02, S11, S13–S16. |
| 6. Preserve owner authority and shipment invariant | `draft.md` §6 | **Met.** Steward chooses namespace; depot managers choose offline queue policy; web owner governs route/redirect; shipment reference cannot replace crate ID. Decisions remain explicitly unresolved. |
| 7. Preserve negative constraints | `draft.md` §7 and §1 | **Met.** No identifier purchase, production label printing, scan-as-receipt claim, or movement-history publication through the public care link. |
| 8. Provide coherent evidence-backed proposal and separate executed from proposed validation | `draft.md` §§1–8 and validation table | **Met.** It is one proposal with alternatives, applicability, owner inputs, recommendations and prioritized checks. Research is marked executed only as research; product, scanner, label, resolver, account and deployment validation remains NOT_RUN or proposed. No future test is reported as completed. |

The released plan is correctly treated as a fallible draft rather than an assessor key. Its shipment-number barcode and scan-equals-receipt assertions are explicitly rejected in `draft.md` §1; its missing migration research is addressed with bounded examples; its QR option and all negative constraints are preserved; and its request for an evidence-backed proposal is met rather than answered with a critique-only patch list. Discovery was completed separately before the released plan was consulted, as the handoff says.

## Evidence and validation boundary

I independently checked primary material for the consequential claims and preserved source identity in the critic `source-map.json` and `sources/index.md`. Direct reads confirmed Snipe-IT's uniqueness, label paths, location-custody caveat, v8.3.6 URL/cache behavior, the v8.7.1 issue/PR/release history, Sortly's mobile-only offline behavior and scanning limits, GS1 Digital Link URL handling, Resolver 1.2.1 redirect/404/query rules, Syntax Engine 1.4.1's overflow fix, and GS1 General Specifications 26.0 GRAI semantics. The English Odoo pages timed out on direct open during this review; official Odoo 18 indexed material was available for the cited workflow, WHIN and package/packaging points. That access limitation is recorded; it did not reveal a contradiction, but full page context and actual Odoo behavior remain unverified. The official GS1 26.0 index returned the relevant GRAI section; its very large standard page could not be opened as a whole. No app, hardware, label, resolver, local parser, account, or live service was operated.

This review's source retrieval and reading are research only. It did not execute any product validation. The investigator's proposed validations remain proposed/NOT_RUN. The next concrete inputs, if the cooperative proceeds, are the named owners' decisions followed by the scoped checks in the draft's validation table; they are not a reason to reduce the brief's research scope.


## Native Goal evidence

The actual native activation response is preserved verbatim in [`native-goal-activation.json`](native-goal-activation.json). It reports the exact requested objective, `threadId` `01a12442-0c95-7643-b270-e68f2dd0f28e`, status `active`, `tokensUsed: 0`, `timeUsedSeconds: 0`, and `createdAt`/`updatedAt: 1791609756` (2026-10-10T05:22:36Z). The activation tool did not expose a separate native `goalId`; that provenance field is UNKNOWN. No activation diagnostic occurred.
