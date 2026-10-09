# I03 planning draft — independent critic review

**Stage:** ER11 B-03/control, M05 retained-investigator critic  
**Reviewed:** 2026-10-09  
**Candidate reviewed:** `/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/B-03/control/research/draft.md`  
**Inputs:** the exact brief, four predecessor files, and declared research source root in the critic input map. No other job, campaign/history, evaluator, or counterpart materials were consulted. Primary-source rechecks and locators are in this stage's `source-map.json` and `sources/primary-evidence.md`.

## Overall assessment

The draft is a strong, usable response to the brief and revealed plan. It preserves the paper-tag and two-family pilot constraints, does not turn projected germination into inventory, keeps contact details out of seasonal-worker flows, and leaves the nursery's two explicit operating decisions open. It compares all six exact P clauses and does not treat its proposed checks as executed. The alternatives are materially different: nursery-specific vendors, ODK as a bounded form-capture pilot, a conditional custom local-first application, and ERPNext as a configurable ERP. Vendor behavior is consistently described as a claim needing demonstration.

The draft needs a material correction to its ERPNext issue-evolution account and two clarifications to the offline data lifecycle before another stage relies on it. These do not overturn its product direction or justify rejecting any P clause. A smaller encryption caveat and test-acceptance detail would improve precision. This is critique only; I have not edited the candidate draft.

## Material findings

### M1 — Correct and narrow the ERPNext issue/fix/release chain

The draft says the v15.6.1 report is “not evidence of a verified final fix.” The primary issue page now shows that issue #38796 was closed as completed in PR #38754. That PR is marked merged on 2023-12-17, says it fixes #38796, and includes a test; the PR activity shows the v15 backport #38806 and the v15.7.0 release entry on 2023-12-20 [ER11-S29, ER11-S30]. Thus there is evidence of a merged fix and backport for the specific reported return/cancellation path. The research source map's locator points to #38840, while the issue page's visible activity and linked fix identify #38754; reconcile that source lineage rather than carry #38840 as the resolution.

The evidence does **not** establish that every old-stock reconciliation/cancellation scenario is fixed, that this path was exercised against a representative nursery migration, or that current v15.122.0 is free of related defects. The draft should narrow its claim to that distinction: cite the merged/backported fix for #38796, retain migration/reversal testing for the nursery's data, and avoid treating this historical report as a current defect. The issue page also lists a separate later “not able to cancel SCR with Batch” item in the v15.7.0 release notes; do not conflate that with #38796 or infer one fix covers the other [ER11-S30].

This is a material evidence correction for O3. It strengthens, rather than removes, the proposed ERPNext reversal test. It does not establish ERPNext as a fit for the nursery.

### M2 — Separate upload receipt from accepted inventory and promiseable quantity

The product-direction section already says offline observations become accepted stock only after synchronization **and reconciliation**, and the P2 event list already carries both server receipt time and reconciliation status. But other phrases say an offline action remains pending until “the server accepts it.” That wording can collapse two different events: ODK Collect moves a finalized offline form into a Ready-to-send state, then changes it to Sent after upload; its workflow documentation does not define the nursery's inventory reconciliation or authorization rule [ER11-S21, ER11-S22]. This separation is a product-design inference from the limits of those submission docs, not a claim about Central malfunction.

Keep four states distinct in any next version: locally captured; uploaded/transport-received; validated/reconciled into the accepted stock ledger; and promiseable/held under the nursery's still-open allocation rule. An upload acknowledgement must not itself increase firm availability. The draft substantially implies this, so the needed correction is consistent terminology across its direction, P2, validation proposals, and any future UI labels—not a new architecture decision. The collision and retry tests are good; explicitly include a case where the server receives a form but business reconciliation is delayed or rejects it.

### M3 — Carry clock and catch-up limits into the conditional local-first recommendation

The discovery notes capture that a reconnect must catch up missed remote events, deterministic checkpoints require a stable tie-breaker, retries may resend writes, and client clocks cannot be trusted. The final draft retains retries, conflicts, deduplication, and an accepted ledger, but its P2 event list emphasizes local capture time and server receipt time without saying that device time cannot establish authoritative event order. RxDB's current docs say a reconnect can miss streamed events and should trigger checkpoint catch-up; documents need deterministic checkpoint ordering, and a server should replace or avoid trusting client `updatedAt` values [ER11-S26].

If a custom replicated app remains an option, carry these as conditional requirements: retain capture time as an observation, use stable event identity and server-side ordering/receipt or another explicit sequence rule, and reconcile missed remote events after reconnect. Add clock-skew and reconnect-gap cases to the existing collision/retry proposal. These are not reasons to require RxDB or to prescribe its data model; the evidence is an architecture example, not the selected product.

## Clause-by-clause disposition audit

The quotations below reproduce the revealed plan exactly. No clause should be rejected or silently rewritten.

| Clause | Draft disposition | Critic assessment |
|---|---|---|
| **P1:** “Link propagation batches and bench locations to projected readiness windows and customer allocations.” | Retain; already covered; add tag/tray identity, units, forecast/count/accepted/allocated/promiseable separation, and lineage. | Supported and appropriately bounded. Keep the nursery's count-to-allocation rule open. ERPNext's `batch_qty` is a read-only Float and `stock_uom` is a read-only link fetched from the item; that illustrates a quantity-with-unit stock balance, not a germination forecast [ER11-S25]. Do not let the ERP field type imply fractional plants or settle the nursery's unit rule. |
| **P2:** “Record tray moves and fulfillment changes in a phone-friendly workflow that can coexist with paper tags during the pilot.” | Retain; already covered; add pending/offline states and paper compatibility; compare alternatives; reject offline local decrement as globally accepted reservation. | Supported. Keep server receipt and business acceptance separate (M2). The paper tag remains the physical reference for this season. The proposed alternatives are useful and not overclaimed. |
| **P3:** “Show uncertain readiness and quantity changes without representing estimates as firm promises.” | Retain; already covered; separate readiness interval, forecast, counted stock and confirmed quantity; preserve unknown thresholds. | Supported. Labels/icons and second-language content are options to test, not established preferences. Keep readiness confidence, review cadence and staleness threshold unresolved until staff choose them; do not invent probabilities. |
| **P4:** “Restrict customer contact and delivery details to staff who need them for fulfillment.” | Retain; already covered; minimize worker data and test permission paths; optional encryption. | Supported and materially well scoped. ODK Data Collectors can create submissions but cannot view the submissions table, while form-attached Entities can be available in an authorized form context, so checking the form data itself is justified [ER11-S23]. Keep encryption supplementary. Add its key custody and lifecycle caveat (minor finding below). |
| **P5:** “The owner of available-quantity adjustments and the approval for substitutions remain nursery decisions.” | Retain as user decisions; present three count-ownership models and substitution alternatives; offer a pilot default only for decision. | Correctly preserves both open decisions. Keep the proposed propagation-lead/packer/coordinator split visibly optional; do not configure access, automation, or a role policy from this suggestion without nursery confirmation. No evidence establishes which role is right. |
| **P6:** “Wholesale access and the handling of missed seasonal windows are not yet specified.” | Retain unknowns; defer wholesale; distinguish a missed readiness interval from a missed season and present response choices. | Supported. The review flag/no-automatic-action behavior is a safe proposal, not an inferred customer contract. Keep notice, carryover, partial fulfillment, substitution, cancellation and refund authority open. |

## Minor findings and optional refinements

1. **ODK managed-encryption lifecycle.** The optional-encryption paragraph mentions the key/passphrase and client-side gaps, but omits two decision-critical consequences in the currently inspected ODK docs: Central cannot recover a lost managed-encryption passphrase, and project-managed encryption cannot be disabled under the documented version; submissions already received before encryption is enabled are not retroactively encrypted. The draft already says to check export and recovery, so this is a bounded optional caveat, not a reason to add encryption to the pilot [ER11-S24]. If retained, require an explicit key-custody/backup plan and state what historical data is in scope.
2. **Validation acceptance criteria.** The twelve proposals are concrete and mostly discriminating. Several already have binary outcomes (no silently lost/duplicated event; no automatic promise or customer action). Before a pilot, set user-approved pass/fail thresholds for measures such as completion time, acceptable correction/error rate, reconciliation delay, and maximum data staleness. Preserve the fact that these values are currently unknown rather than inventing numerical limits.
3. **P5 presentation.** “Proposed pilot default for decision, not an assumed rule” is adequately qualified, but it may anchor the unresolved role decision. Retain the competing A/B/C alternatives adjacent to it and label the default as a discussion hypothesis only. This is a presentation concern, not a false correction.
4. **P4 encryption wording.** Use ODK's term “project-managed encryption” rather than an unqualified “project-managed” if another stage expands the optional detail; the two modes have different export and key-recovery consequences [ER11-S24].

## Findings that do not warrant correction

- The ODK offline-form distinction is accurate: official Central docs state ODK Web Forms do not support offline submission; Enketo's offline-capable flow queues submission and sends automatically only if the form remains open when connection returns. Collect has its own downloaded-form, finalize, Ready-to-send and sent states [ER11-S21, ER11-S22].
- The ODK issue evolution is carefully qualified. Issue #1703 records the v1.28.0 form-list/individual-download messaging distinction; the Oct. 2021 maintainer comment says manual-download messaging had been addressed and planned to apply the pattern elsewhere. The draft correctly does not call that comment proof that every upload path shipped [ER11-S28].
- The draft's criticism of shared mutable quantities on disconnected devices is supported as a warning about the inspected architecture, not as a theorem that every possible offline protocol is impossible. Its proposed single-writer/physical-allocation alternative preserves that distinction [ER11-S26, ER11-S27].
- The ERPNext batch model and access-control discussion stays conditional. Pinned schema fields, parent linkage, quantity and UOM are not presented as nursery-specific behavior or evidence of offline readiness [ER11-S25].
- The alternative-product pages remain vendor leads rather than verified capabilities, and the draft asks for quotes and live demonstrations. I did not independently retest those vendors; their inherited IDs and provenance remain ER11-S17–S20 in the nested upstream source map.
- The draft distinguishes executed reading/reveal work from unexecuted app, device, user, vendor, budget and privacy checks. No implementation/runtime check was run during this critic stage either.

## Review outcome

**Disposition:** Return for targeted revision at the next assigned stage. Keep all six P clauses and the overall direction. Prioritize M1 (specific ERPNext fix/backport chain), then harmonize upload receipt versus reconciled inventory and carry checkpoint/clock behavior into any conditional replicated-app path. Apply the optional encryption and acceptance-criteria refinements if space permits. Preserve unresolved nursery decisions and the explicit non-execution status of all proposed validations.

**Critic limits:** This review independently inspected the complete authorized predecessor draft and evidence notes and rechecked the cited primary pages listed in `source-map.json`. It did not run software, execute a sandbox witness, contact a vendor, test user access, or evaluate a live nursery workflow. It makes no claim about operational fitness, legal compliance, current vendor contracts, or current runtime behavior.
