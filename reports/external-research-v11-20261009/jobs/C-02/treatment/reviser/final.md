# H02 — C-02/treatment/reviser final (M16)

**Status:** Complete reviser artifact after plan reveal and independent critique. This is a product-scope and validation proposal, not an implementation record, procurement decision, or legal applicability opinion. Research evidence below was captured on 2026-10-09; mutable documentation may since have changed.

## Scope and conclusion

H02 describes a small shellfish farm with twelve harvest crews, two packing sheds, and a broad coastal inlet. Supervisors assign beds, pickup windows, and packing-line capacity. Crews currently record quantities and lot labels on waterproof cards, and some work occurs without mobile coverage. Buyers need reliable lot-level handoffs but must not see crew phone numbers or internal quality notes. Weather, buyer demand, and locally issued closures change operations. Several crew members speak different first languages; the shed has a shared touchscreen used with gloves. Managers need to see lots waiting for handoff, packed, or held for review, and correct transcription errors without erasing who changed a value. The initial system budget is $14,000, with some annual spend available. A one-species, one-shed start is being considered. The farm has not decided who may release a held lot, which outside notice should be linked to a bed, or whether buyers need direct access or a paper record.

The useful next step is a bounded fit-and-cost pilot, not a platform selection. ODK Collect is an Android field-form client and Central a managed review backend; fit depends on actual device and form-builder constraints. ODK Collect/Central is a candidate for a trial because its documented offline form queue, activity history, and account model may fit the field-to-shed workflow. That evidence does not establish that ODK is the best fit or affordable within the budget. Compare it with AppSheet and a paper-first flow using the farm’s devices, 12-crew workload, privacy requirements, actual buyer needs, backup/recovery requirements, and current written quotes. GS1 EPCIS/CBV is a standards and export reference, not a required first-release product.

Retain waterproof records while evaluating the contemplated one-species, one-shed pilot. Model bed assignment, pickup windows, line capacity, and workload across all twelve crews; this does not require all crews to become live digital users before the farm chooses a pilot cohort. Digital status must not be confused with server receipt or with legal harvest permission. The system may preserve closure evidence, manually mapped bed associations, and review holds; the authorized farm/Authority process decides whether harvesting or release is allowed.

## O1 — Useful approaches discovered

| Approach | Potential fit for H02 | Conditions and limits |
|---|---|---|
| **ODK Collect and Central** | Offline field forms can remain in a visible Ready to send queue; Central supports form-scoped accounts, review, and activity history. A trial could use harvest/pickup and shed packing/handoff forms. | Finalized, queued, received, packed, held, and handed-off are different states. Corrections need deliberate form configuration and version checks. Offline Entity conflicts make shared mutable lot status risky; prefer stable lot IDs and separate event records. Test the actual versions, devices, access, recovery, and cost. [R01][R02][R03][R05] |
| **AppSheet** | A managed no-code route may make a quick shed dispatch or packing-board prototype possible. It is materially different from ODK form capture. | The app must first be launched online; delayed sync queues changes, and its documentation cautions against prolonged offline use over days or weeks. Offline browser use requires the page to remain loaded; Google maps cannot be cached for offline maps. Audit History retention is seven days for ordinary history and fifty-three days for Enterprise Plus, with richer filtering/analytics requiring Enterprise. Security filters alone are not complete protection. No pricing or plan fit was researched. Test the data-source controls and shared-device cache. [R09][R10] |
| **GS1 EPCIS/CBV** | A useful vocabulary for event time, lot/object and quantity, business step, location, and disposition. Map an export later if a buyer needs machine-readable traceability. | It is a standard, not a first-shed application or evidence that this farm needs GS1 identifiers, a resolver, or an EPCIS server. A disposition can persist until a later event changes it, so the farm’s own workflow must record status changes explicitly. [R08] |
| **Paper-first digital handoff** | Crews keep waterproof cards; the pilot shed transcribes and verifies them, records receipt/packing/hold/handoff, and gives the buyer a controlled printed record. It reduces shore-side device and coverage dependence. | It delays visibility and adds transcription labor. The card-to-lot match, duplicate/missing-card checks, re-entry correction history, and print privacy must be validated. Compare labor and error rates with direct offline entry rather than assuming a digital form replaces field cards. [R07] |

No current prices were researched. Do not infer a cost winner from product documentation. Obtain current quotes for software/hosting, devices, setup, training, support, backup/export, connectivity, printing, replacement hardware, and any buyer integration. Compare first-year and recurring annual cost to the $14,000 initial ceiling and the farm’s available annual spend.

## Candidate workflow and records

This is a vendor-neutral pilot requirement, not a decision to build a particular schema.

1. **Plan work.** A supervisor records the assigned bed/area, crew, planned pickup window, intended shed, species, and available line capacity. Reassignments, schedule changes, and capacity overrides retain actor, time, and reason. The one-shed pilot may leave the second shed out of operation, but its records must identify which shed handled an event if later expansion is approved.
2. **Create an offline lot.** Each harvest lot receives a stable farm lot ID before or at harvest. Carry that ID onto the waterproof card and every later digital event. Record harvest date/time, bed/area as manually assigned, quantity and unit, crew code, and a source-card reference. Keep internal identity details out of buyer outputs.
3. **Demonstrate safe offline lot identity.** A stable, collision-resistant farm lot ID is an outcome to verify; preallocated crew/device ranges are one option, not a requirement. Another scheme is acceptable if it demonstrates uniqueness, reuse detection, and safe recovery/reissue. Distinct event IDs are optional. Test same-card re-entry, reused IDs with a different card, conflicting contents, and uncertain origin; surface each for reconciliation rather than overwriting or double-counting. Keep a source-card link.
4. **Track operational and sync states separately.** The local transmission path should distinguish draft, finalized/queued locally, and received by the server. The operational path should show the farm’s chosen stages for harvest recorded, pickup waiting/assigned, received at shed, packed, held for review, and handoff complete. A queued local form is not a server-confirmed record; “packed” is not “handed off”; and “held for review” does not imply either legal permission or denial. The farm must decide how an authorized hold decision appears before implementing any release state.
5. **Make event history reconstructable.** Linked event records are one possible design. The selected approach should reconstruct harvest, pickup, receipt, packing, hold/review, correction, and handoff with actor, time, quantity/unit, location, and source as needed. If split/merge is allowed, preserve lineage; otherwise block or flag it. A separate event ID is not required by EPCIS. [R02][R08]
6. **Retain physical records and confirm tag status.** Keep the waterproof source card linked to the digital lot. The brief does not establish whether it is an official tag. Do not replace, print, or represent a digital record as an official tag until local Authority applicability and content are confirmed. [R06][R07]

### Correction history and recovery

The P2 outcome is a retrievable history of prior/corrected values, actor, and time, tied to lot and source/card as applicable. Keep original harvest evidence distinct from later transcription correction. A reason is useful but a farm-policy choice unless required; correction review is conditional. History may be append-only or use another tested method preserving attribution and prior values. Do not prescribe event sourcing or treat one audit file as complete without testing.

For a proportionate pilot the farm may set digital retention, backup/export, restore, and canonical-source practices; these are operational choices, not added P2 requirements.

The NSSP evidence below describes a 90-day chronological retention period for the shellstock tag after a container is emptied or retagged; that is not a blanket finding that the farm’s digital history has the same retention rule. Set digital retention from the actual applicable record obligations and operational need, then test the configured policy. [R03][R07][R16]

### Closure notice provenance and hold behavior

Preserve, for every notice the farm elects to represent, the issuing agency/authority, notice identifier, original URL or document copy/version, issue and effective times, received time, person recording it, person verifying it, area description or geometry/version, and the person/date/reason for the farm’s manual area-to-bed mapping. Preserve later notice revisions rather than replacing the evidence. Manual bed mapping remains a reviewed farm/Authority decision; the software must not infer that a notice geometrically covers a bed or that a bed is legally open.

The farm must choose the authoritative notice issuer/source and define how it is checked. Missing, stale, expired, corrected, or ambiguous notices should follow the farm’s written policy; a conservative pilot default to evaluate is “hold for review until the designated verifier resolves it.” Record the source evidence and hold, but do not calculate, state, or imply legal harvest permission. A role authorized by the farm and the relevant Authority process make harvest/release decisions. No jurisdiction, closure publisher, or validated inlet-to-bed mapping was provided, so no source feed or legal interpretation is selected here. [R06][R07]

### Buyer privacy and access

Buyer-facing data must never include crew phone numbers or internal quality notes. Keep crew identity/contact data and internal notes behind role-based access. Use explicit crew, shed, manager/reviewer, and buyer access scopes; revoke lost-device credentials; and clear or protect shared-touchscreen sessions and local caches. Central’s App Users are restricted to assigned forms, but assignments and exact version behavior must be checked. [R05]

P3 does not decide which fields buyers need. After the P6 channel decision, the farm should approve a minimal field list against buyer need and applicable record rules. Candidate fields to evaluate include the lot identifier, harvest/pack information, quantity and unit, area designation, and handoff details; inclusion of any field remains subject to that decision and review. Apply the same allowlist to buyer accounts, printed copies, exports, and any cached buyer view. Printed copies need controlled generation and reprint handling; direct access needs a buyer-specific view and account/session controls. Do not assume a hidden screen or an app security filter protects fields in an export or underlying data source.

## O2 — Primary-source behavior and applicability

### ODK offline, edits, conflicts, access, and language

- **Offline queue and edit prerequisites.** Collect stores forms locally; finalized offline submissions wait in Ready to send, and a successful upload changes them to Sent. Auto-send is the preferred/default Central App User configuration when connected. Editing finalized/sent forms requires form-level opt-in and Collect v2025.2 / Central v2025.1.4 or later. Collect-side edits apply the form version active when the submission was originally filled and are available only while that submission remains on its device. Changing the definition to disable edits affects new submissions but does not retroactively disable already-filled submissions; once a submission is edited in Central, it can no longer be edited from Collect. Each Collect edit appears in Central activity; manually queued edit versions must be sent in order. An Entity-linked edit changes the submission but not the Entity. These conditions support a trial, not a complete audit/recovery guarantee. [R01]
- **Entity conflict boundary.** Offline Entities require Central and Collect v2024.3 or later. Two offline users can create parallel versions; overlapping property edits are hard conflicts, while Central applies incoming changes in receive order and exposes conflicts. Earlier submissions may hold a chain for up to five days; after that the record is processed with conflict status. This makes a shared mutable Entity status a poor sole lot workflow under uncertain connectivity. Use separate, linked events and test reconciliation. [R02]
- **Audit details and limits.** ODK’s form audit can track old and new answers, prompt for an edit reason, and prompt for enumerator identity. The CSV timestamps are epoch milliseconds; the docs allow one audit row per form instance. Optional location-specific settings have privacy and accuracy consequences and are not requested by H02. Do not capture crew phone numbers or continuous location by default. [R03]
- **Reported audit issue.** Issue #5550 describes a missing-audit-event scenario involving a field-list group, deferred validation, and older Collect versions; it was still open in the source capture and no confirmed fix was established. It is a reproduction target, not proof that current Collect is defective. Do not make audit.csv the sole change history without testing the exact selected version/form workflow and comparing other records. [R16]
- **Accounts and translations.** Central separates staff Web Users from restricted App Users; App Users’ form access is explicitly assigned and can be revoked. Verify roles and shared-device behavior on the chosen version. XLSForms can translate user-facing labels, hints, media, and validation messages, but language columns must be consistent and complete and blank cells remain blank. Collect’s menu/button language is separate from form text; native speakers should test both. The language used is not directly returned in Central downloads unless explicitly captured. Actual crew languages are unknown, and translation does not establish glove usability. [R04][R05]

### Shellfish record and traceability boundaries

The 2023 FDA NSSP Guide describes durable, waterproof, Authority-sanctioned shellstock tags of at least 13.8 square inches (89.03 cm²), prescribed harvest identity/date/area/species/quantity information, and chronological retention for 90 days after a container is emptied or retagged. Its conditional bulk-tag provision is limited to a single area, day, and harvester/leaseholder, with added shared information and container count or estimated quantity; a bulk transaction record includes consignee information. Authority requirements and any state trip-record plan still need confirmation. These source facts do not establish that current waterproof cards are compliant tags. [R07]

FDA’s Food Traceability List includes fresh/frozen bivalve molluscan shellfish, while the FDA page also states an exception for raw bivalve shellfish covered by NSSP and specified other provisions. Species, product form, processing/packing steps, transaction, jurisdiction, and regulatory role are not supplied. Therefore, this draft makes no conclusion that a particular FDA rule applies or does not apply. Confirm with the relevant Authority or qualified advisor before representing the digital system as satisfying a legal record obligation. [R06]

EPCIS 2.0.1 provides useful event concepts: required eventTime is a timezone-aware ISO date-time; quantity carries a numeric amount and unit of measure; event context includes business step, location, and disposition. A disposition can persist until changed, so a later event should explicitly supersede it. These are sound export/schema considerations, not a requirement to add a GS1 identifier, EPCIS server, resolver, or EDI exchange to the pilot. [R08]

### AppSheet product behavior

AppSheet can cache app data and definitions, but the device must first launch online. Delayed Sync queues changes for later deliberate sync. The product documentation cautions against use offline for days or weeks because definitions/data may become stale and late updates can override other changes. Browser offline use depends on the page remaining loaded; its offline maps are unavailable. This may still merit a one-shed board trial, but it is a material risk for long offline crew work and closure mapping. [R09]

AppSheet Audit History is useful for app troubleshooting, not an assumed indefinite lot correction record: the notes report seven days of ordinary history and fifty-three days for Enterprise Plus. Rich filtering/analytics requires Enterprise; the security guidance warns that security filters are not complete protection and recommends securing the data source. Plan limits, current prices, source retention, data location, and shared-device behavior were not researched. [R10]

## O3 — Issue/fix/release evolution and what it establishes

The ODK Collect history shows a useful but bounded error-feedback evolution. Issue #1703 reported weak feedback when connectivity failed during blank-form download or finalized-form send. A comment on v1.28.0 reported clearer form-list errors but generic failures for individual forms. Later issue #4489 specified a failed-download count, form ID/version, and per-form explanation; it linked the work to #1703 and closed through PR #4830. The PR merged on 2021-10-06 at commit `e08a3a5ae2c22c2f4cc0dc21ce3db6bcb63208a9`; the v2021.3.0 release included it and highlighted more detailed download errors (tag commit `75ebdb7e6c159be6c7d6d15af3d38963900548e4`). The earlier v1.28.0 tag is `05d295a791121e2e6f0be6df14c60775161a9b61`. [R11][R12][R13][R14][R15]

This chain supports requiring visible per-form/lot sync status, actionable failures, safe retry, and reconciliation. It does **not** prove that every upload, send, or sync error was fixed; the described change concerned download errors, and earlier comments still reported generic per-form failures. #5550 is a separate old-version audit report, not part of this fix chain and not evidence of a current defect. [R11][R12][R13][R14][R15][R16]

## O4 — Exact revealed-plan comparison and dispositions

Disposition terms used here: **correction** means clarify or add a requirement needed to preserve the brief; **optional enhancement** is useful but not required to accept the core plan; **user decision** remains for the farm to decide; **already-covered** means the plan has the requirement; **rejected** means the proposed implication is unsupported or contrary to the brief; **uncertain** means evidence or acceptance criteria are unresolved. Each clause below is quoted exactly from the revealed plan.

### P1

> “Track harvest lots from crew entry through shed handoff, packing, and review hold.”

**Disposition: Correction, scoped.** The core path is covered. Clarify stable collision-resistant offline lot identity (mechanism open), local queued versus server-received states, and bed/window/capacity/receipt/pack/hold links. Collision/re-entry and source-card linkage are acceptance details. Ranges are one option, separate event IDs optional, split/merge conditional if allowed (otherwise flag/block), and official-tag integration awaits Authority confirmation. Exercise modeled twelve-crew workload and one shed, but leave live cohort to the farm. [R01][R02][R07][R08]

### P2

> “Preserve a change history for corrections to quantities and lot details.”

**Disposition: Correction, outcome-based.** Preserve retrievable prior/corrected values, actor, time, and lot/source linkage as applicable. Append-only is acceptable but not mandatory. A reason is recommended and review may be useful, but neither is required absent farm policy. Retention, backup, restore, canonical-source, and approval are optional pilot controls or farm/Authority decisions. Validate chosen form/version and history; #5550 is a proposed old-version regression, not proof of current failure. [R03][R07][R16]

### P3

> “Restrict crew contact details and internal quality notes from buyer-facing records.”

**Disposition: Already-covered** (the constraint is clear and must be retained as a hard privacy boundary). Do not send crew phone numbers or internal quality notes to buyers. P3 does not define the buyer’s full field list; decide fields only after P6 selects a channel and the farm checks buyer need and record duties. Validate a buyer account, printed copy, generated export, direct data path, and shared-device cache/session after sign-out and role switching. [R05][R09][R10]

### P4

> “Provide multilingual labels and glove-usable shed controls for the initial pilot.”

**Disposition: Already-covered; acceptance criteria uncertain.** Keep multilingual labels and glove-usable controls as initial-pilot obligations. Actual languages, device, gloves, conditions, and pass thresholds remain unknown. Native speakers should review form text and the separate app interface; representative users must test glove interaction. Larger spaced controls and other interaction ideas remain hypotheses. [R04]

### P5

> “Lot-release authority and the chosen source for locally issued notices are farm governance decisions.”

**Disposition: User decision** (retain exactly as governance, do not appoint a manager or assume authority). Before configuring holds or release, the farm must name an authorized role for release, choose the notice issuer/source, name a notice verifier, and adopt a stale/ambiguous/corrected-notice policy. Preserve issuer and notice provenance and the farm’s manual area-to-bed mapping. The software records evidence and holds for review; it must not determine legal harvest permission. [R06][R07]

### P6

> “Buyer access versus paper handoff and expansion beyond one species and shed remain undecided.”

**Disposition: User decision** (both choices stay open). Compare printed buyer records and controlled buyer access on current cost, demonstrated buyer need, privacy, connectivity, record criteria, support/recovery, and field/transaction workload. Do not assume app access is needed or that paper is cheaper without measured labor and quotes. Keep the initial trial at one species and one shed; expansion is a later farm decision informed by reconciliation, uptime/offline behavior, cost, privacy, user acceptance, and Authority review. No buyer field list or expansion decision is made in this draft. [R05][R07][R09][R10]

**Additional disposition — rejected inference:** The evidence does not support declaring ODK the winner, asserting a price/cost advantage, claiming all upload/send errors are fixed, treating waterproof cards as legally sufficient tags, or allowing software to certify a bed as open. Reject each inference while retaining the relevant evaluation or governance question. [R06][R07][R11][R12][R13][R14][R15][R16]

## Reviser resolution of the complete critique

- **M1/P4 accepted:** requirement is already covered; acceptance criteria remain uncertain. Keep the pilot obligation.
- **M2/P1 accepted and narrowed:** preserve identity/state/workflow outcomes; ranges are optional, event IDs optional, split/merge conditional, tag integration subject to Authority review, and live cohort undecided.
- **M3/P2 accepted:** preserve old/new values, actor, time, and lot/source link. Reason is recommended; review conditional. Retention, backup, restore, canonical source, and audit architecture are operational choices, not P2 defects.
- **M4/R01 accepted and independently checked:** current guide confirms original form-version use, on-device limitation, Central-edit exclusion, and non-retroactive definition changes. The test cases are proposals; no runtime was run.
- **M5 accepted:** #1703/#4489/#4830/v2021.3 supports download-error feedback, not general upload reliability. R13 SHA is inherited; critic re-open failed. #5550 is old-version evidence, not a current defect claim.
- **Minor findings 1–4 accepted:** ID mechanism open; split/merge conditional; reason/review policy-dependent; NSSP facts describe 2023 Model Ordinance and require local confirmation.
- **Minor findings 5–6 accepted:** twenty lots is not statistical; zero silent failures is only a tested-case threshold. Twelve-crew workload is distinct from live cohort.
- **Minor findings 7–8 accepted:** prices unknown, no cost winner; source browsing executed, runtime/restore/privacy/language/usability/legal/procurement/field checks remain proposed.

Sequence a first pilot around offline identity/reconciliation, corrections and version cases, privacy/accessibility, local notice/tag governance, then fit/cost. This does not waive P3 or P4.

## Conditions, farm decisions, and unresolved facts

The following must be resolved before a production choice or legal/compliance claim:

- **Authority and jurisdiction:** identify the farm jurisdiction, applicable Authority, actual species/product form and handling, official shellstock tag, retention and trip-record requirements, and any relevant transaction/processing rules. The supplied evidence is not a case-specific legal determination. [R06][R07]
- **Release role and hold rules:** the farm names an authorized role and defines which evidence is required to place, maintain, or clear a hold. This draft deliberately assigns no authority.
- **Notice governance:** choose the issuer/source, a verifier role, how the source is checked, a stale/ambiguous/revised notice policy, and a manually reviewed area-to-bed mapping process with provenance. A generic feed has not been shown to cover this inlet.
- **Buyer channel and fields:** collect buyer requirements and choose paper or direct access after comparing the P6 criteria. Approve a minimal buyer field list only then. Phone numbers and internal quality notes remain excluded.
- **Digital record policy:** define canonical history, retention, backup/export and restore procedures, identity for shared-device actions, and correction-to-card linkage. Digital history retention is not inferred from the 90-day shellstock-tag rule.
- **Languages and accessibility:** identify actual crew languages, device/screen, glove and environmental conditions, and co-designed pass thresholds. Translation columns must be complete; actual language choice capture is optional unless needed for operations or audit.
- **Procurement:** get current written setup and recurring costs and test operational fit against the $14,000 initial limit and available annual spend. Current product pricing, support, hosting, device cost, and licensing were not researched.
- **Pilot boundary:** the first trial may operate one species and one shed but must exercise 12-crew load and all workflow links. The second shed and additional species stay out of initial production scope pending pilot evidence and a separate farm decision.

## O6 — Executed checks and proposed discriminating validations

### Executed research checks

The discovery/source-map record reports that public primary documentation pages, the versioned GS1 standard, FDA NSSP PDF and Food Traceability List, official Google AppSheet help, ODK GitHub issue/release pages, and GitHub public API metadata were opened or queried and summarized in the permitted source notes. The issue/fix/release references and their limitations are described above.

**Not executed:** no product runtime, form, configured account, device, shared touchscreen, shellfish tag, closure-notice feed, buyer report, restore, legal review, procurement quote, or field trial was available. No software test or comparative fit/cost trial was run. Every item below is proposed work and must not be represented as a completed check.

### Proposed validations

All checks below are proposed, not executed. Set workload, outage/recovery, and acceptance thresholds with the farm and Authority. Test-case results are not production guarantees.

1. Offline identity and one-shed workflow across the twelve-crew workload model; live digital cohort remains a farm choice. Reconcile cards, local queues, server submissions, receipt, packing, holds, and handoff after reconnecting in different orders. Test duplicate/reused IDs and conflicting origins; require no silent overwrites or double counts in tested cases.
2. Queue/send/recovery using multiple devices, interrupted connectivity, reconnect order, retry, and card reconciliation. Twenty lots is a scenario minimum, not a statistical sample. The error-history chain does not prove all send failures fixed.
3. R01 edit cases: old queued submission under original form version; current definition changed to disable `client_editable`; compare existing and new forms; verify actor/history; check off-device and Central-edited submissions, Entity-linked edits, and manual edit send order.
4. Correct quantity/details and compare prior/current value, actor, time, source, Collect audit, Central activity, and export. Test reason only if adopted, review only if policy requires it. Reproduce #5550 only as a selected-version regression target.
5. Privacy across roles, direct data paths, paper, exports, cache, role switching, sign-out, and lost-device revocation. Buyer output must exclude crew phone numbers and internal quality notes.
6. Language/glove test with identified languages, device, gloves, realistic conditions, native-speaker review, and thresholds set before observation. P4 remains a pilot requirement.
7. After local issuer/release role/Authority are identified, test revised, expired, missing, ambiguous, and changed-time notices; preserve provenance and reviewed bed mapping; ensure no claim of legal openness. Confirm official tag/transaction details with the Authority.
8. Compare shortlisted ODK, AppSheet, and paper-first approaches on common tasks and obtain current written initial/annual quotes against $14,000 and available annual spend. No price or winner is known.
9. After one species/one shed, farm decides whether to expand based on reconciliation, correction/recovery, privacy, user acceptance, cost, buyer feedback, and Authority advice.

## Immutable evidence IDs and source-map locators

Bracketed references in this draft use the immutable IDs in the candidate’s source-map. The locator text below is the corresponding source-map locator; the source-map also records source URL, version, access time, and evidence-note path. Documentation pages were captured as accessed on 2026-10-09 where noted; rendered documentation generally exposed no repository commit.

- **R01 — Managing Forms in Collect (ODK Docs).** Source-map locator: “Sending finalized forms; Editing finalized or sent forms; lines 147-192.” Current docs at capture; edit feature added Collect v2025.2.0 and Central v2025.1.4; docs commit unavailable. Evidence note: odk-offline-edits.md#r01.
- **R02 — Managing Entities in Central (ODK Docs).** Source-map locator: “Managing Entity conflicts; Conflicts related to Offline Entities; lines 599-611.” Offline behavior added Central/Collect v2024.3.0 or later; docs commit unavailable. Evidence note: odk-offline-edits.md#r02.
- **R03 — Form Audit Log (ODK Docs).** Source-map locator: “Enable audit logging, change tracking, reasons, enumerator identification, and log structure; lines 143-152 and 199-251.” Current docs at capture; reason/identify parameters added Collect v1.25.0; docs commit unavailable. Evidence note: odk-audit-history.md#r03.
- **R04 — Multilingual forms (ODK Docs).** Source-map locator: “Building a multilingual XLSForm; translation guidance; language-identification limitation; lines 142-159 and 208-239.” Current docs at capture; docs commit unavailable. Evidence note: odk-language-access.md#r04.
- **R05 — Managing Users in Central (ODK Docs).** Source-map locator: “Roles and App User access/revocation; lines 121-136 and 268-284; Central API changelog v2026.2.” Current docs/changelog at capture; source commit unavailable. Evidence note: odk-language-access.md#r05.
- **R06 — Food Traceability List (FDA).** Source-map locator: “FTL scope and molluscan shellfish row; lines 67-68 and 103-106.” Current FDA page at capture; no code commit. Evidence note: standards-and-alternatives.md#r06.
- **R07 — NSSP Guide for Control of Molluscan Shellfish, 2023 Revision (FDA).** Source-map locator: “Section II Model Ordinance, Chapter VIII, section .02F-G; PDF pages 93-95 / guide pages 82-84; harvest/purchase and sales forms pages 468-470.” 2023 revision; no code commit. Evidence note: standards-and-alternatives.md#r07.
- **R08 — EPCIS and CBV Standard 2.0.1 (GS1).** Source-map locator: “Sections 7.3.6 and ObjectEvent semantics; eventTime schema; business-step/JSON-LD examples; PDF pages 60-61, 78-83, 159-161.” Versioned EPCIS 2.0.1 path; EPCIS 2.0 ratified June 2022; no code commit. Evidence note: standards-and-alternatives.md#r08.
- **R09 — Offline and Sync: The Essentials (Google AppSheet Help).** Source-map locator: “Configure offline/sync, delayed sync, prolonged offline use, browser behavior, and maps.” Current help page at capture; docs commit unavailable. Evidence note: standards-and-alternatives.md#r09.
- **R10 — Monitor app activity using Audit History (Google AppSheet Help).** Source-map locator: “Audit History retention and enterprise filtering; Security: The Essentials security caveat.” Current help page at capture; docs commit unavailable. Evidence note: standards-and-alternatives.md#r10.
- **R11 — User network error report #1703 (getodk/collect).** Source-map locator: “Initial reproduction and Sep 14 2020 report of v1.28.0 behavior; lines 160-181 and 285-312.” Initially Collect v1.11.0; issue comment references v1.28.0; issue is process evidence, not a commit. Evidence note: odk-evolution.md#r11.
- **R12 — Augment Form Download Failed message #4489 (getodk/collect).** Source-map locator: “Description and acceptance criteria lines 129-196; relation to #1703 and milestone v2021.3.” Closed through PR #4830; issue is process evidence. Evidence note: odk-evolution.md#r12.
- **R13 — Improved showing errors that might occur during downloading forms #4830 (getodk/collect).** Source-map locator: “REST response fields: title, state, merged_at, merge_commit_sha, base/head refs.” Merged 2021-10-06; merge commit `e08a3a5ae2c22c2f4cc0dc21ce3db6bcb63208a9`; queried 2026-10-09. Evidence note: odk-evolution.md#r13.
- **R14 — ODK Collect v2021.3.0 release.** Source-map locator: “Release highlights and added PR list include detailed download errors and #4830; lines 150-203.” Tag commit `75ebdb7e6c159be6c7d6d15af3d38963900548e4`; release page accessed 2026-10-09. Evidence note: odk-evolution.md#r14.
- **R15 — ODK Collect v1.28.0 release.** Source-map locator: “Release tag identity lines 150-164; network behavior cross-referenced from issue #1703.” Tag commit `05d295a791121e2e6f0be6df14c60775161a9b61`; release page accessed 2026-10-09. Evidence note: odk-evolution.md#r15.
- **R16 — Missing audit events in field-list after validation #5550 (getodk/collect).** Source-map locator: “Description, reproduction, and later status; lines 139-196, 245-283, 330-357.” Reported Collect 2022.4.4, store 2023.1.2, master prefix 1f9155c; issue open at capture and no fix commit established. Evidence note: odk-audit-history.md#r16.


## Method and evidence integrity

The assigned M16 sequence is reflected here: discovery/evidence maps predate plan reveal; the complete critique compares P1–P6; this fresh reviser retained scope/immutable IDs, independently reopened existing R01 for M4, and recorded critique dispositions. No new source inventory or product answers were added. Discovery remains unchanged.

No parent, counterpart, evaluator, campaign, or prior-history artifacts were read. Usage/billing was not observed; its value is null. No runtime or product test was executed.

SHA-256 integrity references:

- discovery.md — 68d81609d8a93e915edfde6bec88360fb35d07fa6821a35959f08d44aa5ddc7c
- source-map.json — a203e86f80895342067ec86eff8f22d54d97b43d0da2f03278dca8dd16a68b1a
- sources/index.md — 15ef9d32a6faba4e4e6d611ffa5e895a15a9590f79e3e3cfb8bc0e007c0b919e
- sources/odk-audit-history.md — 607fc1830523e8f9f47c7556bf2c00801c7bd94d89d94281ab58d9268547742d
- sources/odk-evolution.md — 4503d881f5dfb9fc317d691a6f8c43b37345ea20b64b3f15622d28edaafcb9a0
- sources/odk-language-access.md — 132cb8f2d08935865b61d43ba52ce64f00dc96cec70ab779fb4a32e527ee1a8f
- sources/odk-offline-edits.md — c2a000e896269685729c6dbc5c9eb7a6e0755cc25d972c8f916dcf2624ecfb68
- sources/standards-and-alternatives.md — e6268c7f0a044522077efefe0756575fe8ae0d3efbeca0bb2fe40c0e4ad91f7f
