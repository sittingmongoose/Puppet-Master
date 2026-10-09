# H02 independent research discovery

Candidate C-02/treatment/research, method M16, discovery pass. This record is based on the H02 brief and independently accessed public primary sources. The case plan remains unopened at this stage. It is not an implementation prescription or a legal applicability finding.

## Brief scope and preserved conditions

A small shellfish farm has 12 harvest crews and two packing sheds across an inlet. Supervisors set beds, pickup windows, and line capacity. Crews currently record quantities and lot labels on waterproof cards. Coverage is weak in some operating areas. Buyers need lot-level handoffs, but must not see crew phone numbers or internal quality notes. Weather, buyer demand, and local closures change operations. The farm wants authorized notices represented without software deciding whether harvest is legally permitted. Crews speak multiple first languages, the shed has a shared glove-operated touchscreen, and managers need waiting, packed, and held-for-review visibility plus correction history. Initial scope may be one species and one shed. The identity authorized to release a held lot, the outside notice source-to-bed link, and buyer access versus paper are undecided. Initial system funding is $14,000; some annual spend is available.

## O1 — Useful products and materially different approaches

### ODK Collect and Central: offline form capture with a managed review backend

Collect is an Android field-form client that works offline and keeps finalized submissions in a visible send queue. Central provides form-scoped mobile accounts, review, activity history, and an administrative interface. The pilot can model a harvest/pickup event form and a shed packing/handoff form, with stable lot IDs and explicit states. This is a better first prototype than building every field capture and sync primitive from scratch, provided the farm accepts form-builder constraints and Android devices.

The field-to-server state distinction (draft, finalized/queued, sent) is operationally useful: the farm can show what was entered, what has not reached a shed, and what has arrived. A saved local form must never appear as server-confirmed. See R01.

### AppSheet: managed no-code alternative for a fast shed board

AppSheet is materially different because an operator can assemble a mobile app over a managed data source without a custom mobile build. It may be useful for a short, one-shed workflow prototype or a packing status board. It requires an initial online launch, local cache configuration, later sync, and explicit conflict/error trials. Its docs warn against prolonged offline periods and describe a limited audit-history retention window. Offline Google map data is not available. Do not adopt it as a permanent lot history until source retention, access control, licensing, and multi-device update behavior fit the farm. See R09–R10. Current pricing was not researched.

### GS1 EPCIS / CBV: transferable event semantics rather than a first-release product

EPCIS supplies a standardized vocabulary for events: event time, object/lot class and quantities, business step, location, and disposition. It is a useful schema and export compatibility reference if buyers later request machine-readable events. It is not a required server or identifier purchase for the first shed. Start with an internal stable lot ID and map fields to event semantics. Introduce GS1 Digital Link or a buyer resolver only if a trading partner needs it. See R08.

### Paper-first digital handoff: smallest operational change

A hybrid alternative keeps crews on their existing waterproof cards and uses the pilot shed to transcribe/verify the harvest record, mark arrival, pack/hold, and give the buyer a printed lot record. It reduces device, coverage, and shared-login pressure on the water. It adds transcription and delayed visibility, so card-to-digital matching and missing/duplicate record checks are essential. A controlled pilot can compare this with direct Collect entry instead of assuming all 12 crews should switch at once.

## O2 — Primary-source behavior, defaults, units, limits, and applicability

### Offline entry, corrections, and synchronization

- In Collect, offline finalized forms wait in Ready to send. With Central App Users, auto-send is the preferred and default configuration when connectivity exists. Do not conflate local queued, sent, approved, packed, and released states.
- Corrections to finalized/sent records from Collect require a form-level opt-in and Collect v2025.2 / Central v2025.1.4 or later. Device-side changes each add an activity-feed entry. Manually sending several edit versions requires order. An edit to a form that creates or updates an Entity changes the submission but not that Entity. See R01.
- Offline Entity lists require Central and Collect v2024.3 or later. Two offline users updating the same Entity create parallel/conflicting versions. Central surfaces conflicts but applies incoming changes in receive order; overlapping property changes are a hard conflict. Offline chains can be held up to five days for earlier submissions before being force-processed with conflict status. Use one lot ID and separate event records; avoid multi-user overwrites of one lot status. See R02.
- For harvest, shed receipt, packed, hold, and authorized release, record each transition as a new event with actor, time, location, quantity/unit, source lot, and explicit reason. A manager should resolve conflicts and decide release.

### Correction evidence and privacy

- Collect form audit can include old/new answers, an actor prompt, and an edit reason. Audit CSV timestamps are epoch milliseconds. An audit row has configurable parameters; the location-specific settings are optional and bring privacy and accuracy tradeoffs. Do not capture crew phone number or continuous location by default. See R03.
- ODK Central can preserve submission edit activity, but the exact current version and form workflow must be verified. An open Collect issue reported missing audit events after changing field-list answers in a deferred-validation workflow at older Collect versions. This is a concrete regression-style risk, not proof of current failure. Reproduce it before relying on audit.csv as the only change record. See R16.
- Central App Users are restricted and have assigned form access; revoke credentials if a phone is lost. Buyer records must use a separate projection or printed form with only approved lot, harvest, pack, quantity, area, and handoff fields. Never expose the crew directory or internal quality notes. See R05.

### Language and shared touchscreen

- XLSForm can translate user-facing question labels, hints, media, and error messages; language columns must be consistently named and complete. Blank translation cells stay blank. Collect app menus/buttons have a separate language setting. Native speakers should verify each language. ODK does not automatically provide a direct record of language used in Central downloads, so capture a language choice if that matters. See R04.
- Neither reviewed product documentation establishes glove-mode usability or a glove-specific minimum touch target. The farm needs hands-on testing using its screen, gloves, temperature, glare, wet surfaces, and representative forms. Use one action per screen, large spaced controls, text plus color for status, and an obvious physical keyboard/scan fallback; treat these as hypotheses to test.
- On a shared touchscreen, test session expiry, sign-out, visible phone/quality data, stale local app data, role switching, and accidental cross-user access.

### Lot traceability, physical tags, and closure notices

- The 2023 FDA NSSP Guide specifies Authority-sanctioned durable waterproof shellstock tags of at least 13.8 square inches (89.03 cm²), with ordered harvest identity/date/area/species/quantity information and 90-day chronological retention. Its bulk-tag provision is conditional and still ties lots to a single area, day, and harvester/leaseholder. A buyer bulk transaction includes a consignee record. Existing waterproof cards may be internal field notes; do not assume they satisfy these requirements. See R07.
- FDA lists fresh and frozen bivalve shellfish on the FTL but states exemptions for raw bivalve shellfish covered by NSSP/other named provisions. Species, product form, packing/processing steps, and regulatory role are unknown. Do not infer legal applicability from the brief. Seek the farm’s jurisdiction and Authority review before making compliance claims. See R06.
- A notice link should preserve the issuing agency, notice identifier, exact URL or document, issue time, effective start/end, area designation or geometry/version, receiving time, person who checked it, and beds manually mapped to the notice. Store notices as evidence and label affected lots “hold for review” when the authority source is missing, stale, or ambiguous. An authorized person decides whether a lot may be released. The software should never label a bed harvest-permitted from an unverified notice feed.
- The farm has not named its jurisdiction or notice source. No generic closure feed has been shown to cover the inlet; no source-to-bed mapping can responsibly be chosen yet.
- Preserve physical tag/transaction records and connect each packing event to input lots. Use explicit quantity units and record split/merge lineage. Do not silently combine lots from different beds, dates, crews, or areas.

### Standardized event mapping

If a buyer needs later system integration, map event fields to GS1 EPCIS concepts: required eventTime as a timezone-aware ISO date-time; event/object or class-level lot; numeric quantity with UOM; business step; read point/business location; disposition. A disposition persists until a later event changes it, so a stale “released” code can be dangerous if someone omits the event that supersedes it. For the pilot, own operational statuses should be versioned and display time, source, and actor. See R08.

## O3 — Issue/fix/release evolution

Collect issue #1703 began with no-connectivity errors during download or send. A v1.28.0 comment said form-list requests had clearer feedback but individual form failures remained generic. In 2021, issue #4489 specified a count and per-form ID/version/error details, linked back to #1703, and closed through PR #4830. The merged implementation commit was e08a3a5ae2c22c2f4cc0dc21ce3db6bcb63208a9; v2021.3.0 commit 75ebdb7e6c159be6c7d6d15af3d38963900548e4 includes the PR and advertises more detailed download messages. This supports designing offline sync with visible per-item states and actionable errors, not assuming a form queue is self-explanatory. The issue history says the later error pattern would be applied to upload paths; it does not establish that every send failure was fixed. See R11–R15.

Separately, Collect issue #5550 reported a form-audit gap under a particular field-list and deferred-validation workflow. It was still open in the viewed issue state; no verified fix/release was found. Record this as a validation target and do not claim it is repaired. See R16.

## Initial validation proposals

These are proposals, not executed system checks.

1. Offline queue: enter at least 20 lots across two devices, close/reopen/reboot, complete pickup and packing without coverage, restore connectivity in different orders, and reconcile every source card, queued form, and server submission. Assert no missing or duplicate lot/event IDs. Verify unsent is visually distinct from server received.
2. Concurrent edits: update one lot on two devices while offline; verify overlap conflict detection, event ordering, manager resolution, and that the older form version cannot silently override a current release decision. Reorder forms to test ordered edit sending.
3. Correction history: change a harvest quantity and correct a transcription; compare the new value, prior value, actor, reason, timestamp, review state, and source card. Reproduce issue #5550 with deferred finalization on the selected Collect build. Inspect exported audit CSV and Central activity feed.
4. Privacy: exercise crew, packer, manager, and buyer accounts on the actual shared touchscreen. Try direct URLs/exports and role switches; prove buyers cannot see phone numbers or internal quality notes, and crews cannot browse unrelated submissions. Check what remains cached after sign-out.
5. Language/gloves: each crew language speaker completes a harvest-to-hold flow using wet/gloved hands. Check field names, choices, errors, confirmation labels, keyboard behavior, target spacing, readability, and language captured. Confirm no blanks or untranslated values.
6. Tag and handoff: compare the physical tag, internal card, shed record, and buyer output for lot identity, authority area, date, species, quantity/UOM, retention, split/merge, and consignee. Validate the farm’s actual tag against its Authority’s current requirement.
7. Closure evidence: have two authorized staff transcribe the same notice; introduce a correction, missing end time, changed area boundary, and expired link. Verify provenance, reviewer, affected bed/lot, stale alert, hold, and authorized release. The system must not calculate harvest permission.
8. Device and cost: test one candidate touchscreen and crew phone class in the actual shed/shore environment; check power, offline storage, backup and export/restore. Obtain current quotes for the $14,000 initial limit and annual support before selection.

## Execution record before plan reveal

Executed: public primary documentation pages, versioned GS1 standard, FDA NSSP PDF, FDA FTL page, official Google AppSheet help, ODK GitHub issues/release pages, and GitHub public API metadata were searched/opened and summarized in source-map.json with bounded evidence notes.

Not executed: no app runtime, form, device, shellfish tag, closure notice feed, permission configuration, buyer report, legal review, or field trial was available. Validation items above remain proposed. Usage/billing was not observed and is null/unknown.
