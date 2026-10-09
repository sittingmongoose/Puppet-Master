# Independent evidence-first critique — I02 treatment draft

**Review order:** I read the exact I02 brief and public primary sources, and saved `evidence-first.md`, the evidence notes and source map before opening any predecessor draft. I then read the complete declared treatment/research `draft.md`, `discovery.md`, `source-map.json`, `revealed-plan.md`, `sources/index.md`, and all seven topic evidence notes under the input map's own-arm source root. I directly revisited consequential Lend Engine, Cheqroom, AppSheet, W3C and Snipe-IT primary pages. No parent, counterpart, evaluator or campaign/history artifact was read; no extra agent, account, trial, runtime or product test was used. Source lineage, exact URLs, versions/commits, locators, timestamps, operations and limitations are in `source-map.json`.

The critique challenges facts, conditions, plan dispositions, omissions and proposed checks. The final author's adjudication is in `final.md`; the source-backed recommendation is not authority merely because it appeared in the predecessor or because a product vendor says so.

## Material findings

### M1 — Lend Engine must remain a synthetic-data lead, with additional gates

The predecessor correctly flags Lend Engine's under-13 policy, lack of demonstrated transaction-scoped fields, backup-tier discrepancy and unproven cleaning gate. Direct review sharpens the risk: its current policy says the Service does not address children under 13 and says it will delete child-under-13 PII it discovers, with a specific toy-library exception for a child's age/date of birth with guardian consent. This does **not** establish that staff-entered caregiver/child-linked clinic information is permissible or impermissible; ask in writing, and do not enter identifiable records until clinic privacy review and vendor response. The policy says user data for an account is retained while active, defines inactivity as no administrator access for more than 60 days and then says the account is permanently deleted; data is hosted in the EU. This deletion default and region need explicit confirmation and an exit/backup plan.

The policy describes due-date emails sent the day before, and says transactional emails can be stopped by removing a member's email; it does not describe a channel preference/consent/opt-out preference field. The product page advertises editable message text but the specific workflow must be demonstrated. The policy says Free/Standard hosting is non-SSL and Plus SSL, while the current price table marks SSL for every displayed plan. The draft should record this source inconsistency instead of implying it is reconciled. Its phrase “strongest low-cost lending-workflow lead” is acceptable only as a **lead for a synthetic demonstration**, not a product selection or evidence of lowest total cost. (E12–E14; SRC-01–03.)

**Adjudication:** Necessary qualification. Keep Lend Engine as a procurement/demo lead; require written age/child-data, data-location/contract, backup/deletion and SSL answers before identifiable use; test loan-field isolation, readiness gating, caregiver reminder preferences and task accessibility. The public materials do not by themselves settle legal eligibility or actual configured behavior.

### M2 — P1's safety gate is a necessary correction; role design is a choice

The draft is right that a check-in or a cleaning note does not establish readiness. The brief specifically says staff cannot reliably tell if a returned device has been cleaned **and checked** before reassignment. A released device must therefore stay unavailable until both operational steps pass, and the control that allows assignment must consult this blocked/ready state. Cheqroom's official docs support the warning: open operation requests do not affect availability, whereas a separate configured availability flag may remove an item from availability (E15; SRC-09–12). Snipe-IT's status features and Lend Engine's repair/cleaning location do not prove the same gate in a clinic configuration.

The draft treats “only an authorized role” and actor/timestamp/location fields as part of the correction. Those are sensible assurance details, but the plan/brief do not prescribe a specific release role or audit schema. An automatic gate and a controlled human release are both possible implementations; the clinic must choose who handles cleaning/checking, while a named-role permission and recorded outcome are optional design controls unless the trial shows they are needed for safety.

**Adjudication:** Necessary correction is explicit `Returned → cleaning → functional check → Available`, failed/incomplete check remains blocked, and assignment/reservation is denied until pass. Keep role/audit details as optional implementation choices and trial acceptance criteria, not as extra fixed product canon.

### M3 — P2's fields are correct; do not resolve fitting-record scope or identity prematurely

The predecessor lists the brief's values accurately and correctly warns against storing family-specific information on a reusable device record. The minimum patient identifier is not specified in the brief; a device ID plus opaque loan reference might suffice, or the clinic may need an approved patient/appointment reference. “Fitting settings” may be an encounter-specific setting record linked to a loan, or a device/fit record governed by the clinician. Treat transaction scoping as a safety hypothesis to test and a clinical-owner decision, not a known product fit or a universal storage schema. Caregiver contact details are not themselves explicitly enumerated; the brief requires a contact preference, so use the minimum contact/reference source approved by the clinic and avoid importing a full clinical chart.

**Adjudication:** Agree with the minimization and no-full-record boundary. Keep a separate loan/fit history that prevents a later family seeing prior data, but leave identifier, field visibility and fitting-note linkage to clinical/privacy owners. Synthetic sequential-loan testing is required before choice.

### M4 — P3's task validation is right; narrow the WCAG claim to relevant criteria

WCAG 2.2 SC 1.4.1 supports a visible non-color cue. The draft also correctly calls for the real staff screen-reader user, keyboard access, labels and usable errors. W3C SC 4.1.3 covers applicable success/result, waiting, progress or error status messages; it does not require a live announcement for every screen change. Excessive announcements can themselves hinder use (E03/E21; SRC-18–20).

**Adjudication:** Keep end-to-end user acceptance as mandatory and identify task-relevant status announcements, control names/roles/states, focus, and form errors. Do not turn a specific ARIA implementation or “announce every update” into a requirement. No accessibility work was executed.

### M5 — P4 mixes explicit requirements with optional policy decisions

The brief requires plain-language reminders and caregiver contact preference, so whether there is any reminder workflow in the six-month pilot is not an open product choice: it is part of the required scope. The exact channel(s), delivery provider, consent/opt-out rules, language/interpreter path and authorized view roles are unresolved design/policy decisions. The predecessor correctly identifies privacy and shared-workstation requirements, but risks over-prescribing consent, opt-out and interpreter mechanisms as universal correction when the brief does not specify legal basis, jurisdiction or channel. Keep them as clinic/privacy-owner decisions and evaluate vendor capability. It is safer for test reminders to avoid device models/names or fitting data when those might disclose hearing-related care; “item details” in Lend Engine's defaults need review. Its current policy's email suppression by deleting the member email is a material usability/record-integrity concern, not a demonstrated preference workflow (E12–E14; SRC-03).

The staff view must protect the next family from the previous family's record. Individual accounts, minimum access, timeout and reset are plausible controls. The draft's tests of back navigation/cache/export/print are appropriate discriminating checks, but inactivity timeout and reauthentication are implementation choices to verify rather than exact wording of the plan.

**Adjudication:** Required: plain reminder, correct recipient/channel preference, minimal content, staff-safe exposure boundary. Clinic decision: available channels, consent/opt-out, interpreter delivery, roles and retention. Add a reminder test for absent/wrong preference, preview content, wrong recipient, failed delivery, and next-family screen reset. Do not enter real family data during evaluation.

### M6 — P5 correctly leaves authority with clinical governance

The draft preserves the director's unresolved choice and does not decide who may amend fitting notes after a handoff. Retaining an attributed history (and reason, if the clinic approves it) is sensible optional design guidance. Do not assume an append-only clinical record, determine the role here, or use system administration as a substitute for clinical authority.

**Adjudication:** Agree; explicitly retain as an owner decision. Any trial uses synthetic settings and tests the chosen permissions only after the clinical owner defines them.

### M7 — P6 should keep two different scopes distinct

Identifiable-history duration is expressly undecided and cannot be inferred from software defaults. A retention owner must decide the period/trigger, deletion/anonymization, backups, exports and applicable records obligations before any identifiable live data is entered. The draft is appropriately cautious but does not state a duration. Appointment integration is different: the brief says a later connection may be useful but is not in the approved first-year budget, so it is outside this pilot's deliverable scope; revisiting it later is an option, not a present pilot decision or dependency.

**Adjudication:** Agree with no invented retention period and no full-record import. Keep a synthetic vendor trial possible while governance decides retention. Exclude appointment integration from the six-month/first-year funded build; retain only a post-pilot review option.

### M8 — Candidate comparison is broad enough, but rank is conditional

The discovery covered Lend Engine, Blueprint OMS, AssetTiger, hosted Snipe-IT, Cheqroom, AppSheet, myTurn, a small custom app, the existing split lists and paper contingency. This exceeds a narrow “tracker only” search and preserves alternatives. The shortlist ordering can be used to order demos, but not as a procurement ranking: Lend Engine's child-data policy is a major gate; Blueprint is only sensible if already licensed; AssetTiger's offline queue and accessibility report need clinic-task trials; Cheqroom's open work orders do not gate availability and its two-admin starting list cost is USD 6,600/year before add-ons; AppSheet's ten Core-seat list calculation is USD 1,200/year if not included by an eligible Workspace plan and has an app-owner/support cost; myTurn evidence is marketing-level. Current prices and terms are mutable. Do not assert all the AppSheet offline path is unsafe: the documented last-writer-wins issue is same-row collision; schema and online-first controls may avoid it, but must be tested (E09–E11/E16; SRC-08, SRC-13–17, SRC-28).

**Adjudication:** Preserve these options and constraints. Use a quote-and-synthetic-demo screen, not a winner. AppSheet can remain a build alternative for online-first, small normalized data; no offline allocation is accepted without collision tests. Paper is only a controlled, reconciled outage procedure.

### M9 — Snipe-IT evolution evidence is valid, with one separate unresolved report

The predecessor's issue #18951→PR #18964→v8.5.0 chain is accurately described: a regular user in a multiple-company/location-scoped v8.4.1 setup reported a maintenance attachment/view permission problem; a dedicated permission merged at `bd4150a`; the maintainer says cross-company historical access is not fixed by that patch; v8.5.0 `90c8689` lists the fix (E17–E19; SRC-24–26). The currently listed v8.8.0 snapshot is time-sensitive, not a deployment recommendation. This satisfies the requested issue/fix/release/evolution obligation and supports a scoped regression test.

Independently surfaced issue #18750 is separate: a reporter described reusable request state on v8.4.0 after checkout/check-in. It now displays Closed but the issue page shows no branch/PR, so closure does not establish a fix. This matters only if a trial uses Snipe-IT requestables; it does not negate asset-tag custody evidence. A test should cover it if that workflow is selected (E20).

**Adjudication:** Keep #18951 chain as the primary evolution example and distinguish it from #18750. Do not claim the latter is fixed; add a conditional request-state regression test. Test the currently deployed supported version and permissions.

## Clause-by-clause plan challenge summary

| Clause | Critic's disposition challenge | Adjudication for final |
|---|---|---|
| P1 lifecycle | Necessary safety rule is cleaning **and** functional check before assignment. Role-release/audit schema is a recommended control, not text mandated by the brief. | Correction: explicit fail-closed readiness gate. Role and event details remain optional choices/tests. |
| P2 minimum details | Exact brief fields are right; patient identity and whether fit settings live on a loan or separate clinician-approved fit history remain unresolved. | Correction to make field/visibility testable; user decision for identifier, fit record and access. Never migrate full chart. |
| P3 accessible controls | End-to-end screen-reader/keyboard test is required. Do not infer every status change needs an ARIA live region. | Already covered; make acceptance measurable against relevant WCAG 2.2 criteria and real user's task. |
| P4 reminders and exposure | Reminder and preference are required. Channels, consent/opt-out and interpreter-path implementation remain decisions. Shared-workstation isolation is mandatory; specific timeout implementation is not prescribed. | Correction to test correct recipient/preference, minimal plain-language message and next-family boundary; optional controls chosen in design. |
| P5 amendment authority | Correctly leaves the policy open; append-only, reason and history are implementation suggestions. | User decision; no role is assigned in this research. |
| P6 retention/integration | Retention stays open; approved first-year budget clearly excludes appointment-system integration. | User decision for retention; integration is out of this pilot, with a later review only. |

## Minor findings and validation improvements

- Give the independent options equal treatment in the final without pretending every alternative has equally strong evidence. Preserve conditional Blueprint and myTurn leads and the split-workflow/paper downsides.
- The predecessor validation table is strong: it separates proposals from executed work and tests privacy leakage, gate behavior, two-site outage, accessibility and reminder delivery. Add Lend Engine's exact email preference/suppression and plan-policy discrepancy, a synthetic current/previous loan export/delete test, and the conditional Snipe #18750 request regression.
- Test timeout/reopen behavior on the actual waiting-room workstation, but do not assume a timeout alone satisfies privacy. A physical monitor/viewing-angle check is also useful, as the user requirement names waiting-room exposure.
- A product's “availability” label, SOC 2 statement, SSL claim, VPAT, or HIPAA support statement does not establish clinic suitability. Require current contract/security documentation and task evidence. HHS requirements are conditional on the clinic/data being within HIPAA scope; this review did not determine that fact.
- AppSheet Core is priced at USD 10/user/month, so ten paid seats are USD 1,200/year—not USD 600—before other services. A lower Core charge may apply if existing Workspace licenses include it; verify before procurement (SRC-13).

All proposed checks remain unexecuted. No objection turns the proposal into a tested product behavior; no product is selected by this critique.
