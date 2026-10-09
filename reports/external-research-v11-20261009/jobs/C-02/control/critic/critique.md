# ER11 C-02/control/critic — H02 full critique

**Assignment:** `control/critic/assignment.md`  
**Input map:** `control/critic/input-map.json`  
**Reviewed material:** the complete H02 brief; the complete control/research `draft.md`, `discovery.md`, `revealed-plan.md`, and `source-map.json`; and all ten source summaries/evidence files under the declared `control/research/sources/` root. The exact six plan clauses are reproduced below. Current public pages were reopened for this review; the unchanged source IDs and locators are recorded in [source-map.json](source-map.json), with a navigable evidence index in [sources/index.md](sources/index.md).

## Overall assessment

The research draft is a strong, appropriately bounded pilot recommendation. It preserves the brief’s material constraints and unsettled decisions, keeps the paper-backed workflow and multiple implementation approaches visible, avoids claiming that any cited product already fits the farm, and distinguishes proposed checks from executed work. I found no plan clause disposition that should be reversed, no basis to reject the pilot recommendation, and no false claim that a validation ran.

Two material additions should be carried into any later revision: the ODK client audit’s timestamp semantics need to be stated precisely where the draft uses audit evidence, and the ABALOBI setup flow has a consequential site/organization data-mobility limitation missing from the demo conditions. These qualify the validation and product-fit advice; they do not invalidate the relevant plan dispositions. Minor clarifications and validation improvements follow below. This is a critique only; I did not edit or repair the candidate draft.

## Material findings

### M1 — ODK audit timestamps are useful evidence, but not an authoritative occurrence clock

The draft correctly separates the crew-reported event time, device capture, and later central receipt, and correctly warns that a device wall clock can be wrong. The current ODK audit-log documentation adds a relevant implementation detail: the form-start timestamp uses device time; later audit events are formed from elapsed time added to that start time. ODK says the absolute timestamps can therefore be inaccurate, even though elapsed intervals within and between events in one editing session are accurate. A server-received time is a separate fact and does not repair a possibly wrong client start time. [S02, current locator in source-map]

**Impact:** This is a material clarification for P2 and the offline/audit validation. A proposed ODK fit test should record three distinct facts where available: the time written on or reported from the source card, client audit time/duration (including its clock basis), and server receipt time. Exercise skew before opening the form and across app/device restart; do not present the client audit timestamp as the verified time of harvest. The draft’s existing event-history and sync requirements are sound and already point toward this separation; they need this more exact ODK limitation.

### M2 — ABALOBI setup has a one-way data-placement constraint

The draft appropriately presents ABALOBI MONITOR as a demo/reference candidate, not a selected system. Its currently published setup instructions also say that captured data cannot be moved between organizations and that records associated with placeholder sites cannot later be reassigned. The research draft lists the product’s workflow-fit questions but does not retain these setup constraints. [S01, current locator in source-map]

**Impact:** This is material to the product-discovery and onboarding recommendation. Before using the product with live farm records, the farm would need to settle the organization structure, user access, and site list; the demonstrator should use the safe demo route or non-production data until those are correct. This is a caution about setup/data governance, not evidence that ABALOBI is unsuitable or that it should be bought.

## Minor findings

### m1 — Keep the FDA date distinction explicit

The draft correctly treats the FDA page as conditional context and warns about its stale text. On reopening, the upper section calls January 20, 2026 the original compliance date, says FDA proposed moving it to July 20, 2028, and says a 2026 Act directed FDA not to enforce before that date; the lower page still says simply that the compliance date is January 20, 2026. The page therefore has stale, conflicting presentation, while the 2028 statement described in the upper section is specifically a non-enforcement directive (and a proposed extension), not a sound basis here to state that the regulation’s compliance date itself was amended. [S09]

**Adjudication:** The draft already avoids using this page to certify applicability or compliance, so no reversal is warranted. A later revision can describe the conflict as stale compliance-date text versus a subsequent non-enforcement direction, and leave any current legal conclusion to current official materials and qualified advice if the farm’s jurisdiction and species make it relevant.

### m2 — Set pilot-specific acceptance thresholds before usability and reconciliation runs

The eight proposed validations cover the important failure modes: parallel IDs and units, offline queue/restart/conflict handling, corrections, held-lot controls, buyer disclosure, glove/language use, shared capacity, and recovery. The checks are correctly marked proposed. Some pass criteria remain qualitative (for example, “record completion time, errors” and “revise and repeat failed tasks”). Before a pilot, name the tested devices and form/build versions, responsible observer, crew-language participants, and measurable pass threshold for each critical task. For safety-critical properties, thresholds can be direct (zero unauthorized releases, zero prohibited buyer fields, zero lost/duplicated test events); set usability and reconciliation thresholds with farm users before observing results rather than inventing a universal number here.

**Adjudication:** This improves reproducibility; it is not a defect that invalidates the proposed test plan. The draft already distinguishes actual execution from planned work and states meaningful pass conditions for core behavior.

### m3 — Keep source status/version claims scoped to the captured evidence

The source map is unusually careful about mutable docs, old issue reports, and the abbreviated merge hash. The independent recheck still finds #6768 closed by #6910 and #5550 open; the current source pages continue to support the narrow issue/fix claims. ODK audit and Central documentation are mutable and do not expose a frozen documentation commit in this capture, so any later product trial should pin actual Collect/Central versions and exercise the chosen form pattern rather than infer behavior from the current docs alone. This is consistent with the draft’s conditional prototype and regression-test language; it does not warrant rejecting ODK.

## Exact plan-clause dispositions

| Clause | Exact revealed clause | Draft disposition | Critic’s adjudication |
|---|---|---|---|
| P1 | “Track harvest lots from crew entry through shed handoff, packing, and review hold.” | Already covered; retain and make transitions/source linkage explicit. | Supported. The recommendation retains the three manager-visible states, stable lot identity, source-card link, and distinct planned versus actual events. Append-only history and capacity-conflict checks are defensible design refinements, not corrections to the clause. Keep hold release governed by P5. |
| P2 | “Preserve a change history for corrections to quantities and lot details.” | Correction / material refinement; keep the intent, specify non-destructive correction behavior. | Supported. Prior/new values, reason, actor, source, and a separate current view directly operationalize the brief. Do not represent ODK audit alone as immutable or tamper-proof history. Apply M1’s client-time nuance to the ODK test. |
| P3 | “Restrict crew contact details and internal quality notes from buyer-facing records.” | Already covered; strengthen with a separate, allowlisted buyer projection. | Supported and appropriately conservative. The printed docket is a provisional safe default; direct access remains open. A field allowlist plus a disclosure test is more defensible than relying on a hidden field or a submission link. |
| P4 | “Provide multilingual labels and glove-usable shed controls for the initial pilot.” | Already covered; add measurable usability conditions and validation. | Supported. The draft does not infer glove usability or translations from any product page. The actual pilot languages, hardware, and acceptance criteria remain to be established with workers. See m2. |
| P5 | “Lot-release authority and the chosen source for locally issued notices are farm governance decisions.” | User decision; preserve as an explicit blocking decision. | Supported. The draft does not assign authority, choose an agency, or make the software decide harvest permission. Keeping release disabled pending the farm’s decision preserves the brief. |
| P6 | “Buyer access versus paper handoff and expansion beyond one species and shed remain undecided.” | User decision; retain the open choices and provide a safe pilot default. | Supported. One species/one shed and a printed allowlisted docket are framed as pilot defaults, while direct access and expansion stay undecided. The draft correctly asks for buyer evidence rather than asserting paper is sufficient. |

No exact P clause was misread as settled when the brief leaves a decision open. The enhancements do not silently turn a planning decision into a farm decision.

## Scope, alternatives, and preservation review

- **Original scope retained:** 12 crews, two sheds, weak coverage, waterproof cards, the $14,000 initial cap, buyer privacy, locally issued notices, multiple languages, shared glove-operated touchscreen, manager status view, attributable corrections, and the candidate one-species/one-shed pilot all remain visible. The draft leaves jurisdiction, species, units, current equipment, notice authority, release role, buyer delivery, and budget details as unknowns.
- **Discovery and alternatives:** ODK Collect/Central, ABALOBI MONITOR, farmOS Field Kit v1, a paper-first board, a narrow custom event workflow, and optional EPCIS mapping are materially different approaches. The draft labels the fisheries/farm comparators as partial-fit references, not proof of requirements coverage. On this brief, the source set is sufficient to support a bounded pilot comparison; no source establishes a credible all-in cost, so the no-estimate/quote-gate treatment is correct.
- **Issue/fix/evolution:** #6768 → #6910 is accurately limited to a particular offline Entity-access/hash scenario and a merged fix with reported regression checks. #5550 is accurately limited to an old, still-open field-list/deferred-validation audit report. The draft neither generalizes these to all ODK operation nor claims the farm has reproduced them.
- **Standards and legal boundary:** GS1 EPCIS 2.0.1 is framed as optional vocabulary/export guidance; its disposition field records business condition, not legal authority. FDA applicability is conditional and the cited page has stale date text. Neither source is used to make a legal determination.
- **Cost, access, and privacy:** The draft does not infer product price from a “free-to-use” page, treats the $14,000 as a cap rather than a known quote, and proposes a buyer-field allowlist with a print/export leak test. It retains direct buyer access as a decision and distinguishes public form submission from buyer read access.
- **Validation and execution:** All listed checks are proposals. The source inspection and artifact writing are the only completed work recorded. No app/runtime, device, sandbox witness, quote, regulatory determination, or usage/billing telemetry was available or observed. Do not relabel proposed tests as executed.

## Method and evidence boundary

This critic stage used the exact input map and its declared read roots. I did not read campaign, history, evaluator, counterpart, or parent material; add source IDs; use private/provider internals; make account/config changes; run a runtime witness; use nested agents; or edit the predecessor candidate. The public-source reopens only recheck the same ten immutable source IDs from the predecessor inventory. Source status can drift; the access states/locators and the two decision-relevant recheck notes are recorded in the stage source map and evidence index. Usage/billing remains unobserved (`null`).
