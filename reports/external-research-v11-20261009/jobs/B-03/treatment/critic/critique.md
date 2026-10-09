# ER11 independent critique — B-03 / treatment / I03

**Stage:** treatment / critic  
**Method:** M05 retained-investigator; critic review of the complete predecessor research record  
**Native Goal:** 01a1223e-096e-7d30-8d59-766b31d63157 (active when these artifacts were written)  
**Evidence map:** [source-map.json](source-map.json); navigation and bounded notes in [sources/index.md](sources/index.md) and [sources/primary-source-notes.md](sources/primary-source-notes.md).

## Scope and overall assessment

I read only the exact critic assignment and input map, the declared I03 brief, revealed plan, four declared research predecessors, and the two files under the declared research source root. I independently reopened official primary sources relevant to offline conflicts, retry integrity, ERPNext reservation limits, farmOS compatibility, and WCAG applicability. I did not read campaign/history, parent, counterpart, or evaluator material. I did not modify the predecessor draft, run a product, or execute a validation.

Retain the draft’s narrow recommendation and all six plan-clause dispositions. The forecast-versus-confirmed-quantity distinction follows from the brief’s uneven-germination and accidental-promise risk. The draft does not select a platform, claim budget fit, or treat disconnected capture as a shared stock lock. Its uncertainty about phones, policies, hosting, cost, and Field Kit compatibility is appropriate.

One material implementation constraint should be explicit if ODK Entities remain a candidate: current Central documentation says every device downloads all Entities and Entity properties can only be strings (C01). The draft already correctly says to keep customer details out of seasonal forms and entities, but it omits this download and type limitation. This does not reverse a plan disposition or rule out ODK; it tightens its privacy and quantity-data conditions.

## Material finding

### M1 — ODK Entity Lists are not a device-level privacy boundary, and their properties are string-backed

The current official Central Entities page lists two relevant limitations: all devices always download all Entities, and Entity properties may only be strings (C01, “Important limitations”). The page separately suggests choice filters to reduce parallel edits; those filters do not guarantee that unassigned entity data is absent from a device. The draft warns against putting customer details in seasonal forms/entities and notes that data collectors can see entity values through permitted forms. That is directionally right, but it does not state the broader local-data exposure or string-only property model.

If ODK is shortlisted, do not rely on form or choice filtering to separate fulfillment PII from worker-accessible data. Keep names, addresses, and other restricted fields out of every Entity List downloaded to seasonal devices; inspect the actual downloaded data under intended roles/devices. Treat numeric counts saved to Entities as string-backed values needing explicit validation and conversion, rather than assuming numeric types or arithmetic guarantees. This is an ODK design condition, not evidence that ODK is unsuitable for movement/count capture.

## Exact plan-clause review

| Clause | Draft disposition | Critic finding |
|---|---|---|
| P1 — “Link propagation batches and bench locations to projected readiness windows and customer allocations.” | correction | Sound as a clarification: a forecast must not imply a confirmed promise. Cohort splits, verified/released counts, tray lineage, and event modeling are useful options; only separating forecast from confirmed availability is necessary to correct ambiguity. Keep the additional model conditional on nursery practice. |
| P2 — “Record tray moves and fulfillment changes in a phone-friendly workflow that can coexist with paper tags during the pilot.” | already-covered | Correct. Existing tag IDs and a paper fallback preserve the stated current-season constraint. Scanner use and extra provenance states remain optional and need field validation. |
| P3 — “Show uncertain readiness and quantity changes without representing estimates as firm promises.” | already-covered | Correct. The allocatable-quantity formula is conditional and should remain a proposal until units, saleability, and hold policy are decided. |
| P4 — “Restrict customer contact and delivery details to staff who need them for fulfillment.” | already-covered | Correct, with the role boundary still a nursery decision. M1 adds that ODK Entity Lists must not be treated as role-filtered private storage. |
| P5 — “The owner of available-quantity adjustments and the approval for substitutions remain nursery decisions.” | user decision | Correctly left open. The submit/approve/fulfill split is only an option, not an accepted role assignment. |
| P6 — “Wholesale access and the handling of missed seasonal windows are not yet specified.” | user decision | Correctly left open. The draft does not invent a buyer portal or automatic contact, substitution, cancellation, or reallocation. |

No clause should be rejected or labeled uncertain on the reviewed evidence. Optional enhancements include stable event IDs, split cohorts, pending-sync states, non-color cues, and paper reconciliation. Uncertain findings concern platform feasibility, not plan clauses: Field Kit compatibility, price, hosting, and device fit remain unverified.

## Minor findings and clarifications

### m1 — Map ERPNext reservations to order types

The draft correctly calls ERPNext a Sales Order reservation comparator. Pinned v15 code restricts reservations to Sales Orders and computes batch availability as actual quantity minus reserved quantity (C04). The brief includes household and municipal allocations but does not say each municipal allocation is a Sales Order. If ERPNext is evaluated, confirm how those allocations map to its supported voucher workflow or identify another transaction. This is a fit question, not an error in the comparator claim.

### m2 — State WCAG’s scope

WCAG 2.2 defines a web-content accessibility standard; SC 1.4.1 is Level A and says color must not be the only visual means (C08). This is directly relevant if the phone workflow is web content. The coordinator’s need also supports non-color cues as a general usability requirement. Printed tags and native-app checks are useful, but are not by themselves a WCAG conformance test. The draft makes no conformance claim; distinguishing the standard’s scope from broader usability checks would avoid ambiguity.

### m3 — Trace the Field Kit v1 statement

The source index/map records the Field Kit repository README (S28), while primary-source notes additionally state that an older v1 guide calls Field Kit a proof of concept and says it would receive no major feature updates. The notes give no exact guide URL/version/locator, and I did not independently retrieve that guide. The compatibility conclusion is already cautious, so this does not change the recommendation. If retained, add the exact public source under a new immutable ID; otherwise omit that historical sentence.

### m4 — Keep the ERPNext negative-stock caveat narrow

Pinned bundle code calls its negative-batch guard only when allow_negative_stock is false, and the guard exempts a defined stock-reconciliation valuation-adjustment case (C06). The draft’s caveat that the guard is conditional and call paths were not fully traced is accurate. Its proposed adversarial sandbox test is appropriate; static inspection does not establish system-wide behavior.

## Other findings and proposed follow-up

The review supports the draft’s ODK offline ordering/conflict account, including receive-order updates and the five-day hold for out-of-order chains (C01). The Collect issue-to-fix chain (#4589 to merge commit #4655) is accurately limited to historical evidence, not a nursery test (C02–C03). The pinned ERPNext code supports the distinction between recorded stock and future germination (C04–C06). The farmOS.js page warns it is experimental, names a farmOS 2.x data-model scope, and describes last-write-wins merging (C07); the draft correctly treats this as compatibility/conflict risk rather than proof farmOS cannot be extended.

The draft’s proposed validations are discriminating and correctly marked not executed. I recommend four follow-up checks, all unexecuted:

1. If ODK is shortlisted, inspect Entity records/properties downloaded under the actual role/device setup, ensure no fulfillment PII reaches seasonal devices, and test explicit validation/conversion of string-backed counts.
2. If ERPNext is shortlisted, model a household order and municipal restoration allocation; verify whether both can use Sales Order reservations without distorting nursery records.
3. Test status comprehension with the color-blind coordinator and seasonal workers in phone and print views. Apply WCAG SC 1.4.1 to web content where relevant; record print/native checks as usability findings.
4. Before relying on the Field Kit v1 history or current compatibility, record the exact guide/release and pin the client/server versions proposed for evaluation.

No checks above have been run. No purchase, product selection, customer-policy decision, or budget-fit conclusion follows from this critique.
