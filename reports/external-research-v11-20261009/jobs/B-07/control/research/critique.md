# M15 independent critic pass

**Stage:** fresh full criticism after the investigator draft, using the same provider/model in a separate pass. No nested agent was used because the assignment prohibits nested agents. The criticism reviewed the exact P1–P6 plan, discovery, source map, and draft and then re-opened each cited primary URL; the access intervals are recorded in sources/source-access-log.json. Discovery remains frozen.

## Findings and required corrections before delivery

1. **The short brief's batch-handoff goal is not yet explicit in the plan comparison.** Draft P3 adds a use/cleaning record but does not explicitly retain the separate opening goal to make batch handoffs clearer. Add an optional tenant-generated batch reference and handoff state/timestamp linked to the tenant's block, only where useful. Do not make it a product-wide shared batch record or add recipes, customers, sales, ingredient data, or output quantity. Clarify that the brief does not say whether work crosses tenant boundaries; if it does, the board must reconcile that need with P2 before scope changes.
2. **Data-minimization caveat should be more visible in the P3 alternatives.** Ensure any batch reference is tenant-private, user-authored, and optional; characterize it as a traceability pointer, not a recipe/safety record. Current draft already rejects recipe/customer/output data; extend that guardrail to batch handoff records.
3. **P1 model is a proposed correction, not a verified product behavior.** Keep resource occupancy distinct from production/reporting duration. Explicitly test set-up and clean-down intervals on space and equipment separately, including boundary semantics; don't state whether they are included in billable time or which tenant owns the interval because the case does not decide it.
4. **The recommendation is appropriately conditional but could be mistaken for a final procurement decision.** Preserve wording that Food Corridor is only first to demo and not selected. The observed $206/month plan is an in-page price observation; currency selector, platform-fee base, annual term/cancellation, tax, payment volume, implementation and budget period remain unresolved. The source does not promise the tested checklist/export/privacy behaviors. No total-cost or feature-fit conclusion is justified.
5. **Privacy evidence is a potential collision, not proof of a violation.** The Food Corridor tenant article states Daily View and Community access; it does not enumerate all cross-tenant data or say whether these views can be disabled. Keep uncertainty attached. Skedda visibility rules hide holder/title by default for regular users when no rules exist, but dates/times/spaces remain; administrators/system users see booking detail. Do not claim either product passes P2 without tenant-role trials.
6. **Signoff features must not be equated.** Digital PIN sign-in/out records attendance. The monthly checklist example is not a per-booking/equipment signature. A required field at booking creation is not a post-use signoff. The draft makes those distinctions; retain them in final copy.
7. **Access timestamp precision needed repair.** The initial source map wrote exact-looking per-source timestamps that were not individually observed. Corrected source-map.json now marks initial per-request times unknown and attaches exact request/response UTC intervals from later direct re-opens. Keep sources immutable by ID/URL; preserve the access log and disclose that timestamps bracket browser operations rather than being server HTTP timestamps.
8. **The LibreBooking issue chain is valid but narrow.** It concerns recursive buffer-list item ID construction and its rendering path, not whether conflict enforcement is correct. The issue, merged PR, regression assertion, later release note and pinned v7.0.0 code support the chain. Do not imply the future security advisory means v7.0.0 is affected; the current branch's notice is mutable and undisclosed. The install burden/patch ownership remains a condition.
9. **WCAG is not a wet-hands standard.** Keep 24x24 CSS px as the criterion's normal pointer target floor with exceptions, not the product's wet-hand acceptance target. Actual coordinator/screen-reader testing and entrance tablet testing are separate checks. The draft correctly separates them.
10. **Paper transition is evidence-provenance work.** Do not describe paper coexistence as offline product support. Keep actual paper timestamp and later digitization time distinct and reconcile by booking/reference; the kitchen has internet.
11. **P5 and P6 must remain open.** Approval/auto-approval in candidate products is not missing-signoff enforcement. No universal procedure or automatic booking consequence is warranted. Retain the explicit alternative cases and authority decision.
12. **Executed/proposed distinction is clear.** No witness, product interaction, accessibility test, export, concurrent-booking test, installation, or human validation ran. Keep every numbered acceptance check in the proposed list, not in results.

## Obligation coverage audit

- **O1:** three dissimilar approaches are researched (kitchen-specific hosted product; generic hosted scheduler plus separate record; self-hosted open-source scheduler) plus a linked tenant-owned record pattern. Keep strengths and tradeoffs, not a source-count argument.
- **O2:** defaults/units/limits are recorded for selected mechanisms; gaps in vendor docs remain uncertain and turn into demonstration tests. Ensure no gap is converted into a negative feature claim.
- **O3:** the buffer-ID issue/fix/regression-test/release chain has primary issue, PR, code and release sources; scope is explicitly narrow.
- **O4:** every exact P clause appears in the crosswalk with a distinct disposition and supporting condition.
- **O5:** budget ambiguity, privacy surfaces, paper provenance, tenant records, both board decisions, product alternatives, and uncertainty are preserved. Add the missing batch handoff point above.
- **O6:** validations discriminate between alternatives and are all labeled proposed; none are presented as executed.

## Critic disposition

**Revise before delivery** with the three necessary text changes: retain the batch-handoff goal without adding sensitive content; distinguish resource occupancy from production time/billing in P1; and retain exact-access-window caveat beside the source log. The remaining risks are correctly reported as unresolved conditions or user decisions rather than hidden product assumptions.


## Post-critic source-unit correction

A later pinned v7.0.0 test-source re-open confirmed that the regression fixture calls WithBufferTime(3600) and asserts begin/end IDs, but the inspected excerpt does not establish the unit. The earlier “3,600-second” wording in this critique is too specific. Final draft uses the raw fixture value and states the unit is unknown; pre-reveal discovery remains unchanged as required.
