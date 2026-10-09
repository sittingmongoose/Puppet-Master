# H02 — C-02/treatment/research complete draft (M16)

**Status:** Research draft after plan reveal. This is a product-scope and validation proposal, not an implementation record, procurement decision, or legal applicability opinion. Research evidence below was captured on 2026-10-09; mutable documentation may since have changed.

## Scope and conclusion

H02 describes a small shellfish farm with twelve harvest crews, two packing sheds, and a broad coastal inlet. Supervisors assign beds, pickup windows, and packing-line capacity. Crews currently record quantities and lot labels on waterproof cards, and some work occurs without mobile coverage. Buyers need reliable lot-level handoffs but must not see crew phone numbers or internal quality notes. Weather, buyer demand, and locally issued closures change operations. Several crew members speak different first languages; the shed has a shared touchscreen used with gloves. Managers need to see lots waiting for handoff, packed, or held for review, and correct transcription errors without erasing who changed a value. The initial system budget is $14,000, with some annual spend available. A one-species, one-shed start is being considered. The farm has not decided who may release a held lot, which outside notice should be linked to a bed, or whether buyers need direct access or a paper record.

The useful next step is a bounded fit-and-cost pilot, not a platform selection. ODK Collect/Central is a candidate for a trial because its documented offline form queue, activity history, and account model may fit the field-to-shed workflow. That evidence does not establish that ODK is the best fit or affordable within the budget. Compare it with AppSheet and a paper-first flow using the farm’s devices, 12-crew workload, privacy requirements, actual buyer needs, backup/recovery requirements, and current written quotes. GS1 EPCIS/CBV is a standards and export reference, not a required first-release product.

The pilot should retain the farm’s waterproof records and start with one species and one shed. Its workflow must still represent bed assignment, pickup windows, line capacity, and all twelve crews. Digital status must not be confused with server receipt or with legal harvest permission. The system may preserve closure evidence, manually mapped bed associations, and review holds; the authorized farm/Authority process decides whether harvesting or release is allowed.

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
3. **Use collision-safe offline IDs.** Do not depend on a network-generated sequence. Before crews go offline, issue non-overlapping, human-readable lot-ID ranges to each crew/device (or another demonstrated collision-resistant scheme), with a clear reissue process. Keep event IDs distinct from lot IDs. On import, the same ID plus the same source-card reference may be recognized as a re-entry of the same record; the same ID with a different card, conflicting contents, or uncertain origin must be quarantined for review. Never silently overwrite, merge, or count it as a second lot. Record any reconciliation decision and its actor/reason.
4. **Track operational and sync states separately.** The local transmission path should distinguish draft, finalized/queued locally, and received by the server. The operational path should show the farm’s chosen stages for harvest recorded, pickup waiting/assigned, received at shed, packed, held for review, and handoff complete. A queued local form is not a server-confirmed record; “packed” is not “handed off”; and “held for review” does not imply either legal permission or denial. The farm must decide how an authorized hold decision appears before implementing any release state.
5. **Record events and lineage.** Keep harvest, pickup, receipt, packing, hold/review, correction, and handoff as time-stamped events linked to the lot, not as unreviewed concurrent overwrites of one status field. Include event actor, event time and time zone where available, receipt/sync time, quantity with explicit unit, location/shed, reason/source, and any prior event or source-card reference needed to reconstruct the chain. Preserve split/merge lineage; do not silently combine lots from different areas, dates, crews, or source records. EPCIS/CBV fields can guide a future export without imposing a GS1 implementation in this pilot. [R02][R08]
6. **Retain the physical shellstock record.** Waterproof crew cards may be working notes; do not assume they satisfy an Authority-approved tag. Keep the card and official tag/transaction record connected to the digital lot. Do not replace or print an official tag until the farm’s Authority confirms applicable content, format, area designation, retention, and any state trip-record requirement. [R06][R07]

### Correction history and recovery

A correction must preserve the previous value and the corrected value, identify the original lot and card, show who changed it, when, why, and whether it was reviewed, and leave the current value traceable to that history. Keep harvest/source evidence distinct from a later shed transcription correction. Establish one canonical operational change history and define how it relates to the form record, Central activity feed, audit.csv, and retained physical card; no single product audit file should be treated as the only durable record until tested.

Before selection, the farm must decide and verify:
- which record is canonical for day-to-day lot reconstruction and how corrections are appended rather than erasing original evidence;
- how long digital events, correction history, exports, and backup copies are retained, with the Authority/advisor confirming any applicable obligations;
- how often and where backups/exports are made, who can access them, and how a restore is reconciled to source cards and lot IDs;
- how a correction links to the original physical card, original lot, and any resulting split/merge or downstream handoff; and
- how the system displays missing, delayed, duplicate, conflicting, or unreviewed edits.

The NSSP evidence below describes a 90-day chronological retention period for the shellstock tag after a container is emptied or retagged; that is not a blanket finding that the farm’s digital history has the same retention rule. Set digital retention from the actual applicable record obligations and operational need, then test the configured policy. [R03][R07][R16]

### Closure notice provenance and hold behavior

Preserve, for every notice the farm elects to represent, the issuing agency/authority, notice identifier, original URL or document copy/version, issue and effective times, received time, person recording it, person verifying it, area description or geometry/version, and the person/date/reason for the farm’s manual area-to-bed mapping. Preserve later notice revisions rather than replacing the evidence. Manual bed mapping remains a reviewed farm/Authority decision; the software must not infer that a notice geometrically covers a bed or that a bed is legally open.

The farm must choose the authoritative notice issuer/source and define how it is checked. Missing, stale, expired, corrected, or ambiguous notices should follow the farm’s written policy; a conservative pilot default to evaluate is “hold for review until the designated verifier resolves it.” Record the source evidence and hold, but do not calculate, state, or imply legal harvest permission. A role authorized by the farm and the relevant Authority process make harvest/release decisions. No jurisdiction, closure publisher, or validated inlet-to-bed mapping was provided, so no source feed or legal interpretation is selected here. [R06][R07]

### Buyer privacy and access

Buyer-facing data must never include crew phone numbers or internal quality notes. Keep crew identity/contact data and internal notes behind role-based access. Use explicit crew, shed, manager/reviewer, and buyer access scopes; revoke lost-device credentials; and clear or protect shared-touchscreen sessions and local caches. Central’s App Users are restricted to assigned forms, but assignments and exact version behavior must be checked. [R05]

P3 does not decide which fields buyers need. After the P6 channel decision, the farm should approve a minimal field list against buyer need and applicable record rules. Candidate fields to evaluate include the lot identifier, harvest/pack information, quantity and unit, area designation, and handoff details; inclusion of any field remains subject to that decision and review. Apply the same allowlist to buyer accounts, printed copies, exports, and any cached buyer view. Printed copies need controlled generation and reprint handling; direct access needs a buyer-specific view and account/session controls. Do not assume a hidden screen or an app security filter protects fields in an export or underlying data source.

## O2 — Primary-source behavior and applicability

### ODK offline, edits, conflicts, access, and language

- **Offline queue and edit prerequisites.** Collect stores forms locally; finalized offline submissions wait in Ready to send. Auto-send is the preferred and default configuration for Central App Users when connected. Editing finalized/sent forms requires form-level opt-in and Collect v2025.2 / Central v2025.1.4 or later. Device-side edits create activity-feed entries, but an edit to a form that creates or updates an Entity does not update that Entity. Manually queued edit versions must be sent in order. This is promising for a trial, not a guarantee of end-to-end lot history or recovery. [R01]
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

**Disposition: Correction** (core traceability is already covered; required workflow detail is missing). Keep the full path and explicitly connect supervisor bed assignment, pickup windows, and per-shed line capacity to lot events. Define stable offline lot IDs, separate event IDs, and duplicate/collision handling for multiple crews before any digitization. Make local queued versus server-received distinct from operational states. Include split/merge lineage and the waterproof card/Authority tag link. Simulate all twelve crews against one operating shed in the pilot; verify bed, window, capacity, receipt, packing, and hold visibility. Do not expand to a second shed or species without a later decision. [R01][R02][R07][R08]

### P2

> “Preserve a change history for corrections to quantities and lot details.”

**Disposition: Correction** (the goal is already covered; the canonical record and recovery contract need definition). Require an append-only or equivalently recoverable history showing original and corrected values, actor, timestamp, reason, review status, original card reference, and lot/event lineage. The farm must decide digital retention, backup/export cadence, restore ownership, and how recovery is reconciled; get Authority/advisor input on obligations. Validate the chosen version and form workflow, reproduce the #5550 scenario, inspect exported history and the server activity record, and prove backup/export restoration. Audit.csv alone is insufficient until those checks pass. R16 describes older versions and is not proof of a current product defect. [R03][R16]

### P3

> “Restrict crew contact details and internal quality notes from buyer-facing records.”

**Disposition: Already-covered** (the constraint is clear and must be retained as a hard privacy boundary). Do not send crew phone numbers or internal quality notes to buyers. P3 does not define the buyer’s full field list; decide fields only after P6 selects a channel and the farm checks buyer need and record duties. Validate a buyer account, printed copy, generated export, direct data path, and shared-device cache/session after sign-out and role switching. [R05][R09][R10]

### P4

> “Provide multilingual labels and glove-usable shed controls for the initial pilot.”

**Disposition: Uncertain** (translation support is documented; glove usability and acceptance are not demonstrated). Keep both requirements for the initial pilot. Actual languages, shed screen/device, glove types, wet/glare/temperature conditions, and acceptance thresholds remain unresolved. Native speakers must review form labels, hints, errors, and app menu language separately. Co-design measurable thresholds with crews before testing; observe correct completion, wrong entries, missed controls, and recovery under realistic gloves. Do not claim the glove interface is usable based on form translation or large-control design suggestions alone. [R04]

### P5

> “Lot-release authority and the chosen source for locally issued notices are farm governance decisions.”

**Disposition: User decision** (retain exactly as governance, do not appoint a manager or assume authority). Before configuring holds or release, the farm must name an authorized role for release, choose the notice issuer/source, name a notice verifier, and adopt a stale/ambiguous/corrected-notice policy. Preserve issuer and notice provenance and the farm’s manual area-to-bed mapping. The software records evidence and holds for review; it must not determine legal harvest permission. [R06][R07]

### P6

> “Buyer access versus paper handoff and expansion beyond one species and shed remain undecided.”

**Disposition: User decision** (both choices stay open). Compare printed buyer records and controlled buyer access on current cost, demonstrated buyer need, privacy, connectivity, record criteria, support/recovery, and field/transaction workload. Do not assume app access is needed or that paper is cheaper without measured labor and quotes. Keep the initial trial at one species and one shed; expansion is a later farm decision informed by reconciliation, uptime/offline behavior, cost, privacy, user acceptance, and Authority review. No buyer field list or expansion decision is made in this draft. [R05][R07][R09][R10]

**Additional disposition — rejected inference:** The evidence does not support declaring ODK the winner, asserting a price/cost advantage, claiming all upload/send errors are fixed, treating waterproof cards as legally sufficient tags, or allowing software to certify a bed as open. Reject each inference while retaining the relevant evaluation or governance question. [R06][R07][R11][R12][R13][R14][R15][R16]

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

1. **Twelve-crew workload and one-shed flow.** In a controlled one-shed trial, have all twelve crews create lots while offline using the chosen ID scheme; include simultaneous arrivals, changing pickup windows, bed reassignment, capacity pressure, a delayed crew, and reconnecting in different orders. Reconcile every physical card, lot, event, shed receipt, pack/hold, and handoff. Require zero silent ID collisions, duplicate lots, or missing events; same-ID conflicts must surface for review. Confirm managers can see waiting, packed, and held lots and distinguish local queued from server-received records. This directly tests whether the one-shed pilot can carry the full brief workload.
2. **ID collision and duplicate/re-entry policy.** Have multiple crews/devices operate without connectivity; deliberately reuse an ID, re-enter one card, submit conflicting contents, and split a lot. Confirm the system detects each case, prevents silent overwrites/double counts, retains the physical-card link, and records the resolution. Test written/non-network ID recovery after a device is lost.
3. **Offline recovery and transmission errors.** Enter at least twenty lots/events over two devices, close/reopen and reboot, complete pickup/packing offline, then restore connectivity in different orders. Verify every item is clearly queued, received, or failed; retry each failure; reconcile all cards and server records with no missing or duplicate event. Include form-edit ordering and server receipt timestamps. Do not infer that issue #4830 proved all send errors fixed.
4. **Correction history, #5550, and restore.** Correct a quantity and a lot detail against a physical card. Compare old/new values, actor, time, reason, original lot/card, event lineage, review status, Central activity, and exported audit record. Reproduce the field-list/deferred-validation #5550 workflow on the selected version and form configuration. Then export/backup, restore to a clean test environment, and reconcile record counts and history. Pass only if the farm-selected retention and restore policy is observable and no correction erases original evidence.
5. **Privacy across channels and shared device.** Test crew, shed, manager/reviewer, and buyer roles. Attempt access to phone numbers and internal quality notes through buyer screens, printed output, exports, direct links/data-source routes, cached views, and shared touchscreen session switching/sign-out. Verify lost-device revocation and stale-cache cleanup. After P6 decides the channel and fields, test the approved buyer allowlist in every output path.
6. **Language and glove acceptance.** After identifying languages and the actual device, native speakers review every label, hint, validation message, status and menu. With representative wet/gloved users under shed conditions, observe harvest-to-hold and correction tasks. Set pass thresholds with crews beforehand; record completion, entry errors, missed/tapped controls, time if useful, recovery, and any untranslated/blank text. Acceptance criteria and device are unresolved until user research.
7. **Notice provenance, mapping, and hold governance.** Use actual locally applicable sample notices, including revised, expired, missing, ambiguous-area, and changed-effective-time cases. Two designated people independently verify source and manual bed mapping. Confirm the record retains notice version/source, issue/effective/received times, verifier, mapping version, and linked lots; stale/ambiguous cases follow the farm policy and enter review hold. Verify no user interface or export says a bed is legally open merely because a notice was imported.
8. **Official tag and transaction record.** With the relevant Authority, compare actual physical tags and buyer transaction record against the applicable official requirements, including area, date, species, quantity/unit, size/material, retention, and conditional bulk-tag rules. Exercise lot split/merge and consignee recording. The trial does not replace an Authority review.
9. **Alternative fit and cost comparison.** Run the same one-shed tasks for ODK, AppSheet (if shortlisted), and paper-first transcription; record offline behavior, failed-sync recovery, correction history, privacy, language/glove performance, workload/time, and buyer output. Obtain current setup and annual quotes and compare to the $14,000 initial limit and available recurring budget. Decide using documented farm criteria; do not designate a product winner before results.
10. **Expansion gate.** After the one-species/one-shed pilot, review reconciled lot completeness, no silent duplicates, correction/recovery evidence, staff acceptance, privacy incidents, actual cost, buyer feedback, and Authority advice. The farm then decides whether to add the second shed or another species.

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

The M16 sequence was followed: discovery and source-map were saved before the plan reveal; an independent critic reviewed discovery.md, source-map.json, and the revealed clauses; a fresh reviser produced this complete draft from the existing evidence. No new source inventory was added after reveal. The critique led to explicit P1–P6 dispositions and added operational, recovery, privacy, accessibility, and governance conditions here. The discovery file remains unchanged after reveal.

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
