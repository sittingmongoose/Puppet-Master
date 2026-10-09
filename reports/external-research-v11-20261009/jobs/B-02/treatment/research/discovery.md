# I02 independent discovery

**Candidate:** ER11 B-02 treatment / research  
**Research date:** 2026-10-09 UTC  
**Source record:** `source-map.json`; retained bounded evidence and relationship graph: `sources/index.md` and the topic notes linked there.  
**Method boundary:** This discovery was derived from the I02 brief and public primary vendor, documentation, W3C and release sources before plan reveal. No product account, trial, configuration, family data, message, runtime, accessibility session, outage simulation, or product test was run. The exact plan remains unrevealed at this point. Findings here are not claims about a built system.

## 1. Brief interpretation and scope

The clinic needs to lend reusable pediatric hearing devices across two locations to children waiting for fittings or needing a short-term replacement. There are eight clinicians and two reception staff, $7,500 per year for software, no systems administrator, occasional outages, and usually internet at both sites. Each loan has a device identifier, fitting settings, caregiver contact preference and return date, with an interpreter request sometimes needed. The six-month pilot should not require full clinical-record transfer. A later appointment-system connection is outside the approved first-year budget.

I treat the six brief obligations as equal:

- **O1 — Independent discovery:** consider unfamiliar lending, inventory, hearing-clinic and custom-app options beyond any thin plan.
- **O2 — Product/source behavior:** inspect material data, state, role, offline, pricing, unit/type and default behavior rather than trusting feature labels.
- **O3 — Evolution evidence:** trace at least one relevant issue/fix/release chain and state its applicability and boundaries.
- **O4 — Plan comparison:** after reveal, disposition every exact P clause and classify it as correction, optional enhancement, user decision, already covered, rejected or uncertain.
- **O5 — Retained scope:** keep alternatives, constraints, disagreements and uncertainty in a coherent, self-contained final.
- **O6 — Validation:** propose checks that distinguish viable from unsafe choices and clearly separate those proposals from executed checks.

This is a small six-month pilot decision, not a guarantee of production compliance or unlimited feature scope. A later appointment integration is a future option, not a pilot requirement or authorized year-one expense.

## 2. Findings that shape any viable approach

### 2.1 Keep reusable device state separate from loan/family data

Use two conceptual records even if a chosen product uses other names:

- **Device:** clinic device ID/barcode, location, operational/readiness state and minimal device facts.
- **Loan event:** device ID, borrower/loan reference, fitting settings for that specific loan, caregiver's preferred contact channel, return date, optional interpreter request, staff/time at handoff, and return/cleaning/inspection events.

A fitting setting or caregiver preference that persists on a reusable device can be exposed to the next family, can become stale after handoff, and can be misread as current. Those facts belong to a specific loan; never import a full clinical chart to make inventory work. Limit child/family identifiers, define access and retention, and let the director decide who may amend fitting notes after handoff and how long identifiable history is kept. No public vendor page reviewed resolves these clinic-specific governance decisions.

### 2.2 Model readiness as a safety gate, not a note

Recommended conceptual flow:

`Ready → On loan → Returned / quarantined → Cleaning → Inspection → Ready`

Inspection failure should go to a blocked repair/hold state; release requires a named role and a recorded outcome. Return alone must not create availability. Availability must be determined by the status that checkout/reservation actually consults. An open work ticket is insufficient if the product permits checkout while the ticket is open. A cleaning/inspection record should identify device, event time and actor, but family details should not appear in a public/shared task queue.

### 2.3 Plan for outages as a custody decision

Offline scanning, local caching and delayed sync do not prove a shared authoritative inventory. With two sites, simultaneous assignments based on stale status can lead to a single device being promised twice or a unit being lent while awaiting cleaning. The simplest safe pilot rule is online-first: if the system cannot confirm current authoritative availability, pause new assignment. If operations require continuity, use a controlled numbered paper handoff queue, store only the minimum needed, assign one reconciliation owner, and reconcile after connectivity returns before the device is marked available. Do not use two independent stale caches as if they were current stock.

### 2.4 Respect the waiting-room privacy boundary

Use distinct staff accounts, least-privilege roles, short reauthentication/inactivity locking, and a clear logout boundary. Verify that one family’s borrower details disappear before another loan begins, including browser back/history, autocomplete, search, cached offline records, exports and printed lists. Show as little family information as possible at the common workstation. “Staff-only” is a configuration goal that must be proved with accounts and a realistic next-family test, not inferred from pricing or a vendor security statement.

### 2.5 Keep reminders plain, minimal, and preference-led

A reminder should be short and understandable; say what action/date is needed and how to contact the clinic, without diagnosis, fitting settings or other clinical detail. Respect the caregiver’s chosen channel, consent, opt-out and interpreter request. Test wrong/absent preferences, bounced/failed delivery, language and correction. A product's reminder automation proves only that it can send something, not that the recipient, contents, timing or consent are right.

### 2.6 Screen-reader access is an end-to-end requirement

The staff member must complete the core loan/return/readiness workflow using their actual screen reader and keyboard. Provide text status and another cue in addition to color; ensure names, roles, values, errors, required fields and updates are announced. Include device lookup, creating/editing the correct loan, assigning a return date and preference, finding a returned device, blocking it while cleaning/inspection is pending, recording a failed inspection, releasing a passing unit, and issuing or suppressing a reminder. Vendor accessibility statements and a VPAT are evidence to guide evaluation, not substitutes for the user’s task succeeding.

## 3. Independent options found

### Option A — Hosted lending-library service: Lend Engine

**Why it is useful:** The public Plus listing is $25/month ($300/year), allows 10 sites and unlimited team logins, and lists custom fields, staff check-in/out prompts, maintenance and private member site. The feature page describes lending for assistive technology, check-in/out prompts, movement to cleaning/repair, language options and reminder emails. Publicly listed price is far below budget and the concept aligns closely with a lending library.

**Material blockers/conditions:** The product pages do not establish that a returned device is unavailable until cleaning/inspection is completed or that family-specific fields are stored on each loan rather than on the reusable item/member record. The live privacy policy is undated, says the service does not address children under 13 and does not knowingly collect their personally identifying information, with a toy-library guardian-consent exception. This is a material question for a pediatric clinic. Obtain written vendor confirmation about caregiver/child records, any age restrictions, retention/deletion, roles, hosting and terms before entering identifiable data. Backups are shown only on Business ($50/month) in the pricing matrix; policy wording elsewhere describes backups differently, so resolve the discrepancy in writing. Staff screen-reader task, shared workstation privacy and outage conflict behavior are unknown. Do not treat low list price as sufficient for selection.

**Proposed tests:** With synthetic records and assigned staff/test accounts, confirm a new loan has its own settings/contact/interpreter fields, a reused device exposes none of the prior family's data, return automatically blocks assignment, only an authorized staff member releases it after inspection, and shared screen/session behavior is safe. Perform actual screen-reader, keyboard, two-location outage and reminder tests.

### Option B — Hearing-clinic module: Blueprint OMS

**Why it is useful:** The vendor specifically advertises hearing-aid inventory, stock by location, loaner/trial history, loaner agreement and recall near return date. It is the closest domain match among sources reviewed.

**Condition:** Investigate only if the clinic already has it or can pilot the relevant module without buying/duplicating a larger practice-management system or migrating full records. The reviewed public page provides no price and does not establish readiness gate, data isolation, accessibility or security suitability. Ask about the actual minimum loaner module, identifier/data model and current contract; do not infer it is already installed.

### Option C — General inventory tracker: AssetTiger

**Why it is useful:** Basic is listed at $220/year annual for up to 500 items and paid plans allow unlimited users. The product lists checkout/return dates, maintenance history/schedules, status and exports. The FAQ describes role configuration and mobile scans queuing locally while offline. A Jan 2026 vendor-authored VPAT gives a starting point for accessibility review.

**Conditions/risks:** A general tracker may model an item and asset fields but not a family-specific loan event; reviewed pages do not establish the critical transaction-level schema. Verify that settings/contact/interpreter values attach to the loan and do not leak on reuse. Offline scan queueing creates a potential delayed sync/collision issue; no source reviewed says conflicting handoffs are safely adjudicated. Vendor FAQ security claims are not independent assurance. VPAT is vendor-authored and not an actual task test. Test permissions, retention/export/delete, shared-workstation session clearing, role permissions, collision handling, device quarantine gate, reminders, and the real staff screen-reader task before selection.

### Option D — Hosted Snipe-IT

**Why it is useful:** Hosted Basic is listed at $399.99/year, unlimited users/assets, and vendor-described setup, maintenance, updates and backups. Its docs describe unique tags, one active checkout, and status categories such as Undeployable/Pending that can block redeployment; a pending/cleaning state is conceptually useful.

**Material fit limit:** Reviewed custom field documentation applies fieldsets to asset models, not a family loan event, and says encrypted fields become unsearchable/unsortable. This is insufficient evidence for the required fitting settings and caregiver preferences. Do not select it to hold family data unless transaction-level behavior and access are demonstrated without inappropriate persistent asset fields.

**Evolution/release check:** Issue #18951, opened Apr 28, 2026 against v8.4.1 build 22183, reports regular users could create maintenance but could not view/attach files. PR #18964 merged May 4 at merge commit `bd4150a` and introduced a distinct maintenance permission; maintainer context says maintenance inherits asset-company permission and historical cross-company behavior remains separate. Release v8.5.0 (`90c8689`) on May 12 lists the fix. The Sep 30 release page listed v8.8.0 (`2c466fa`) as current. This shows relevant evolution and why role tests matter. It is one reported configuration, not proof every deployment was affected or fixed in all contexts. If trialed, use a current supported vendor version and test least-privilege creation/attachment/history access at both sites. Full trace: `sources/release-chain.md`.

### Option E — Equipment/work-order system: Cheqroom

**Why it is useful:** Business lists up to three locations and customizable roles; an equipment availability flag can be configured to remove a device from availability, and restricted roles can clear it with a recorded comment/attachment. Operations templates include cleaning, inspection and repair types and required fields can be configured.

**Critical distinction:** Cheqroom's documentation explicitly says open work orders do not alter equipment availability. A ticket alone therefore cannot be the cleaning lock. A separate blocking availability flag/status must be set at return and cleared only after a pass. This needs a trial for interactions between work order close, flag clear, reservation and checkout.

**Cost concern:** Business is $275 per administrator per month, up to three sites. One admin at starting price is $3,300/year; two are $6,600/year, before required operations/maintenance add-ons (listed as extra fees with no public amount), minimum seats, tax or service charges. Obtain exact quote and the smallest role setup that supports reception/clinicians. It may fit budget at one seat, or nearly consume it at two before add-ons. Price/security/privacy/task accessibility are unresolved. It is a conditional quote-and-trial candidate.

### Option F — Custom low-code app: AppSheet

**Why it is useful:** A custom Device/Loan schema can make transaction scoping, mandatory return fields and state transitions explicit. Core is listed at $10/user/month; ten paid staff would list at $1,200/year if not included in current Workspace licensing. The table lists a 2,500-row-per-database limit for Core, which needs a retention/volume check. Up to ten test users are listed as free.

**Conditions/risks:** Offline cache requires initial online launch; browser offline use requires the page to stay loaded. Concurrent writes to the same row are last-writer-wins, so competing offline handoffs can overwrite authoritative custody/readiness. Shared waiting-room cache is another privacy concern. The security page describes configurable data sources, caching and customer compliance steps but does not prove that this clinic is eligible or compliant under any particular rules. AppSheet SMS uses a custom Twilio path; its built-in SMS channel is documented as discontinued after Apr 21, 2025. It adds custom app ownership and maintenance work for a clinic without a sysadmin. If chosen, use online-first allocation and fail closed during outage, confirm row/retention limits and terms, and test the app's real conflict and accessibility behavior. No prototype was built.

### Option G — myTurn lending platform

The current overview advertises multiple locations, lending/assets, barcodes/RFID and due/overdue reminders, with June 2026 changes and an assistive-technology library testimonial. This is a useful alternative to include in discovery calls. The public page reviewed does not establish price, child/family privacy terms, accessible workflow, cleaning gate or offline conflict semantics. Keep as a lower-evidence candidate until a quote, contract/privacy documentation and task demonstration are obtained.

### Option H — controlled paper outage fallback

This is a process alternative, not a product. If authoritative current state is unreachable, pause new assignments unless a numbered, controlled paper record is used by a designated person. Reconcile in time order once online; do not release returned units just because a paper note says “returned.” A paper fallback must use minimum identifiers, be stored securely, and have explicit duplicate/correction handling. This is proposed mitigation; no exercise was run.

## 4. Comparative conclusion before plan review

No option can be selected on public evidence alone. **Lend Engine** is the strongest price/workflow lead, conditional on a written resolution of its under-13 privacy language, transaction-scoped loan data, backup terms and tested cleaning/readiness gate. **Blueprint OMS** is worth a targeted check only if already licensed. **AssetTiger and hosted Snipe-IT** are low-cost stock/status candidates, but the reviewed docs do not establish a safe per-loan family data model; they may support a device-only register paired with a separate approved loan record, but that creates split-source and privacy/reconciliation complexity. **Cheqroom** has explicit maintenance controls but its work orders do not gate availability and costs/add-ons may approach or exceed budget. **AppSheet** offers schema flexibility but offline row conflict and local cache behavior make it unsuitable as the authoritative simultaneous offline allocation mechanism without a stronger tested control. **myTurn** merits a quote/demo but evidence is thin.

A six-month pilot should start with minimum device and operational data, no full clinical-record transfer or appointment integration, a separately governed loan-event record, named roles, and an online-first fail-closed availability rule. Before any family data is entered, decide fitting-note edit authority and identifiable retention with the director and verify vendor privacy/security/contract terms. If one product cannot provide both loan-specific data and an enforceable cleaning gate, either separate the workflows with a privacy-reviewed controlled process or reject it; do not paper over a missing gate with a note.

## 5. Proposed validation plan versus executed checks

| Validation | Evidence that would discriminate | Status |
|---|---|---|
| Loan schema and privacy | Create two synthetic sequential loans on one device; confirm all settings/contact/interpreter data are scoped to the loan, then prove a new borrower cannot see the previous loan. Check exports, search, audit and delete/retention. | Proposed; not executed |
| Return/readiness gate | Return a test unit; attempt reserve/check-out immediately; verify it stays blocked through cleaning and failed inspection and becomes available only after authorized passing inspection. Separately test open ticket with no flag to expose unsafe assumptions. | Proposed; not executed |
| Roles/shared workstation | Reception and clinician accounts perform allowed and denied tasks. Leave/lock/reopen the waiting-room browser and start a different synthetic family; inspect back navigation, cached pages, autocomplete, downloads and printouts. | Proposed; not executed |
| Outage/two-site custody | With synthetic test accounts, disable connection or use vendor-supported sandbox. Attempt simultaneous handoff at both sites and test delayed sync/reconciliation. Decide what happens when current authoritative state is unavailable. | Proposed; not executed |
| Accessibility | Staff screen-reader user completes core device/loan/return/clean-release/reminder workflow with real setup and keyboard only; check announcements, focus, forms/errors, status text and non-color cues. | Proposed; not executed |
| Reminder | Check recipient follows caregiver preference; message is plain/minimal, no clinical data, opt-out works, failed delivery is visible, and interpreter request has a clinic-approved path. Use controlled test recipients only. | Proposed; not executed |
| Procurement/compliance | Get written quote and add-ons, data location/retention/deletion, backup details, security/incident terms, role model, support, pilot exit/export, age/child-data position and any required agreement. Review with director/privacy owner before entry of identifiable data. | Proposed; not executed |
| Release/role regression | For Snipe-IT candidate, confirm current supported release/hosted patch, then test regular versus admin maintenance creation, file attachment/view and site/company history scope. | Proposed; not executed |

### Checks actually executed in this research

- Read the exact I02 brief, assignment and exact input-map.
- Reviewed public primary vendor pricing, feature, FAQ/privacy/security/help, accessibility, W3C and tagged issue/fix/release sources; retrieval/locator details are recorded in `source-map.json` and evidence in `sources/`.
- Validated that `source-map.json` parses as JSON.

No runtime, product test, access-control check, trial, offline/concurrency simulation, screen-reader session, SMS, data transfer or legal/compliance review was executed. Those remain proposals above.
