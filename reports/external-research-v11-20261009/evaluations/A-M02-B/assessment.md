# A-M02-B — Fresh independent assessment

**N2 (control): FAIL. N1 (treatment): FAIL.** Each grade follows a separately demonstrated material recurrence defect. Both finals were delivered; all six axes, all P clauses, consequential primary facts and preservation were independently assessed. Relevant review scope is complete. Two FAILs do not establish equal quality, a ranking, a speed win or a cost comparison.

Scientific judgments finalized 2026-10-09T19:43:24Z; deadline 2026-10-09T19:50:10.709968+00:00. All assessment artifacts are saved and verified before native Goal completion. Lifecycle and billing remain separate.

## Assignment and original scope

Exact binding: [assignment.md](/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/evaluations/A-M02-B/assignment.md) and [input-map.json](/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/evaluations/A-M02-B/input-map.json). Rubric: [RUBRIC.md](/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/evaluations/RUBRIC.md). Original brief: [brief.md:3](/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/cases/S08/brief.md:3).

Food bank with 180 volunteers, changing availability, recurring shifts and predictable coverage; mobile access, accessible reminders, privacy-limited sharing and occasional imported rosters. Investigate competing products, constraints/optimizers and fairness with implementation/version evidence. No invented legal requirement or equal-availability premise. The scope is the small brief, not unlimited production guarantees.

Frozen plan [plan-root-only.md:3](/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/cases/S08/plan-root-only.md:3):

- **P1:** Generate recurring shifts from a weekly template.
- **P2:** Assign the first available volunteer alphabetically.
- **P3:** Allow coordinators to swap names.
- **P4:** Email everyone the full roster.
- **P5:** Use local wall-clock timestamps.
- **P6:** Test one ordinary week.

## Independent material findings

### N2-F01 — Volgistics opening recurrence is incorrectly characterized as undocumented

**Type:** MATERIALLY_WRONG (related: FALSE_CORRECTION_OR_REJECTION). **Severity:** Material: central recurrence capability and vendor applicability are mischaracterized; this blocks full quality.

**Original obligation:** Brief line3 recurring shifts/predictable coverage and selected-product investigation; O2 source behavior/applicability, O4 exact P1 comparison, O5 evidence-backed critique treatment. P1 says generate recurring shifts from a weekly template.

Candidate [final.md:10](/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M02-B/control/reviser/final.md:10):

> the vendor pages do not establish whether administrators can create or change recurring openings.

Candidate [final.md:40](/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M02-B/control/reviser/final.md:40):

> the cited pages do not establish recurrence or exception semantics for an opening/template

Other affected or lineage passages: [final.md:10](/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M02-B/control/reviser/final.md:10) (lines 10, 40); [final.md:71](/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M02-B/control/reviser/final.md:71) (lines 71); [critique.md:23](/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M02-B/control/critic/critique.md:23) (lines 23, 25, 27).

**Primary evidence:** [E13: Volgistics Schedule Overview](https://www.volgistics.com/help/schedule/schedule-overview/); [E14: Volgistics Add Schedule Openings](https://www.volgistics.com/help/schedule/add-schedule-openings/); [E15: Volgistics Edit a Schedule Opening](https://www.volgistics.com/help/schedule/edit-a-schedule-opening/); [E16: Volgistics Edit/Remove Schedule Entry](https://www.volgistics.com/help/schedule/edit-a-schedule-entry-or-remove-a-scheduled-volunteer/)

- E13: Mutable help guide; section/symbol: Openings (rendered lines 190–193); coordinator permissions (253–260).
- E14: Mutable help guide; section/symbol: Add an Opening; Example 2: Recurring shift (rendered lines 170–186, 204–219).
- E15: Mutable help guide; section/symbol: Tips for Working with Openings; Change Times; Change Days (rendered lines 148–181).
- E16: Mutable help guide; section/symbol: Regular entry; one-date change; end date; remove scope.

The cited Schedule Overview itself documents ongoing weekday/day-of-month openings, their duration and needed headcount. Its coordinator restriction is role-specific. The linked Add Openings guide specifies weekly patterns and dated calendar appearance, while Edit Opening specifies past/future propagation and independent volunteer entries. The critic's narrow distinction between recurring entries and openings is correct; the final broadens it into an unsupported absence of administrator opening recurrence and change behavior. This is consequential available research, not honest unknown account configuration.

**Limits of the finding:** This finding does not establish first-class holiday exceptions, stable IDs, a future-only edit feature, exact permissions in a paid account, or complete suitability. Those remain legitimate trial questions. P1 is retained rather than wrongly rejected wholesale; the defect lies in evidence characterization and criticism uptake.

### N1-F01 — Enterprise template discussion omits documented Weekly Shift Templates and their update boundary

**Type:** MATERIALLY_INCOMPLETE (related: FALSE_CORRECTION_OR_REJECTION). **Severity:** Material: directly relevant, available weekly-template and created-shift update evidence is omitted in the core P1 adjudication.

**Original obligation:** Brief line3 recurring shifts and competing-product investigation; O2 governing behavior/limits, O4 exact P1, O5 supported critique/preservation. Frozen P1 requires generation from a weekly template, not perpetual autonomous expansion.

Candidate [final.md:47](/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M02-B/treatment/reviser/final.md:47):

> they do not establish automatic weekly occurrence expansion from a reusable template, nor exception or published-occurrence update semantics.

Candidate [final.md:124](/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M02-B/treatment/reviser/final.md:124):

> Automatic expansion, exceptions, and published-occurrence edits remain unverified; those are capability checks and proposed requirements.

Other affected or lineage passages: [final.md:47](/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M02-B/treatment/reviser/final.md:47) (lines 47, 124, 135, 154); [critique.md:18](/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M02-B/treatment/critic/critique.md:18) (lines 18, 20, 22, 24); [V03-better-impact-activities.md:5](/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M02-B/treatment/reviser/sources/V03-better-impact-activities.md:5) (lines 5, 7, 8).

**Primary evidence:** [E01: Better Impact Activities](https://support.betterimpact.com/en/articles/8780736-comprehensive-guide-to-activities)

- E01: Mutable vendor guide observed 2026-10-09; section/symbol: Enterprise Activity Templates; Activity Shifts and Templates → Shift Templates/Create Daily–Weekly/Edit Templates/Add Multiple Shifts/Edit Scheduled Shifts; Backup List.

The same primary Activities guide has a separate Activity Shifts and Templates section: reusable daily/weekly/monthly Shift Templates, every-X-weeks pattern and Add Multiple Shifts using an existing template. It also states template edits do not change shifts already created, and documents individual/bulk shift edits with existing-signup handling. The final/critic/reviser verification inspect the Enterprise Activity Template object and defer core template-generation/update investigation without reporting these directly relevant documented mechanics. The valid Enterprise-versus-recurrence distinction cannot support leaving these available P1 facts out of the final.

**Limits of the finding:** The source is an administrator-triggered workflow; it does not prove an indefinitely extending unattended scheduler, holiday exceptions, identity preservation, actual tier availability or every update choice. If 'automatic' is read narrowly as autonomous continuous expansion, that narrow absence claim may stand. FAIL is based on the omitted documented weekly-template workflow and non-propagation boundary, not a claim that the guide proves unlimited autonomous operation. One underlying omission is counted once.

## Each arm assessed independently

### N2 (control) — FAIL

Independent material recurrence finding N2-F01; other axes and available evidence were reviewed fully. This is not a score inferred from citations, agreement, or hashes.

#### All six rubric axes

**1. Original obligations and explicit constraints.** Original scope is addressed throughout; central available recurrence investigation fails O2 and affects O4/O5. Other constraints/options are retained; production guarantees are not invented as grading requirements.

Actual coverage: {"status": "FULL", "obligations": ["O1", "O2", "O3", "O4", "O5", "O6"], "constraints": ["180 volunteers", "changing availability", "recurring shifts", "predictable coverage", "mobile access", "accessible reminders", "privacy-limited sharing", "occasional imported rosters", "no invented law", "no equal availability"]}.

**2. Consequential primary facts, defaults, units, versions and applicability.** Material recurrence defect N2-F01. Other selected product defaults, solver semantics, fairness mechanisms, standards and release applicability are supported or explicitly externally unresolved. See claim-by-claim checks rather than source-count inference.

Actual coverage: {"status": "FULL for relevant consequential claim clusters", "checked_claim_ids": ["N2-C01", "N2-C02", "N2-C03", "N2-C04", "N2-C05", "N2-C06", "N2-C07", "N2-C08", "N2-C09", "N2-C10", "N2-C11", "N2-C12", "N2-C13", "N2-C14", "N2-C15", "N2-C16", "N2-C17", "N2-C18", "N2-C19", "N2-C20", "N2-C21"], "remaining_claim_ids": []}.

**3. Meaningful unfamiliar discovery and optional alternatives.** Substantive different product/workflow/mechanism routes survive with tradeoffs and policy choices. Roster size does not force optimization. Recurrence understatement/omission is accounted under F01, without erasing the useful discovery.

Actual coverage: {"status": "FULL", "stages": ["discovery", "draft", "final"], "options": ["Better Impact", "Volgistics", "coordinator allocation", "self-signup", "CP-SAT", "open-source Timefold", "managed Timefold API", "multiple fairness measures"]}.

**4. Every exact plan clause and disposition.** All six clauses are independently adjudicated. P2/P4 rejection responds to the brief; P3 retention and P6 enlargement are reasonable; P5 preserves intended local civil time with qualified representation. P1 is retained but its product evidence is defective. Added semantics are not treated as facts asserted by the thin plan.

Actual coverage: {"status": "FULL", "clauses": ["P1", "P2", "P3", "P4", "P5", "P6"]}.

**5. Draft/critique/final preservation and fallible criticism.** Full prose retains supported options/constraints and most critique refinements. Narrow recurrence criticism is valid; final's broadening creates F01.

Actual coverage: {"status": "FULL", "stages": ["complete discovery", "complete draft", "complete critique", "complete final", "stage source maps", "stage source indexes/notes"], "critic_items": ["M01", "m01", "m02", "m03", "m04"], "unread_stage_scope": []}.

**6. Meaningful proposed versus executed validation.** Proposed tests discriminate consequential failures and policies; none is claimed executed. Versioned source regression assertions support an implementation/evolution chain without establishing target behavior or a runtime witness.

Actual coverage: {"status": "FULL", "matrix": "all rows and surrounding execution statements read", "independent_oracles": "source semantics checked where claimed; selected-policy acceptance outcomes remain proposals"}.

#### Original obligations O1–O6

- **O1 — Satisfied:** Suite products, coordinator management, self-signup, custom CP-SAT, open-source Timefold and managed Timefold API are materially distinct options; no roster-size-implies-optimizer premise.
- **O2 — Material defect:** Relevant units/defaults/domain and version checks were substantially performed, but central available recurrence evidence is mischaracterized or omitted. General uncertainty does not excuse that specific available research.
- **O3 — Satisfied with static-source limits:** Issue→quickstart fairness implementation/tests→required load-balance cast fix and v1.13 milestone is real, with non-production and policy limits preserved.
- **O4 — All six clauses covered; P1 evidence defect:** Every exact P sentence is retained in the candidate comparison. Retention, rejection, enhancement, open decisions and uncertainty are distinguished in substance. P1 source characterization remains defective; no wholesale false rejection of weekly recurrence is inferred.
- **O5 — Broad preservation with one false broadening:** Final is full standalone prose, not an ID list. Supported alternatives, uneven availability, privacy/reminder/import/mobile conditions and most critic qualifications remain visible. The recurrence evidence/criticism issue prevents full quality; remaining preservation details are itemized.
- **O6 — Satisfied; proposals not executed:** Synthetic scenarios distinguish policy, constraint and product behaviors. Literature/code inspection is separated from runtime, imports, message delivery and accessibility results. No execution was required or fabricated.

#### Every exact P disposition

**P1 — Generate recurring shifts from a weekly template.** [final.md:71](/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M02-B/control/reviser/final.md:71) (lines 71).

Disposition: Correction; recurrence retained; horizon/template-update decisions open. Retention is appropriate; timezone/exceptions are enhancements to the thin requirement. Entry-specific warning is valid, but opening recurrence absence is materially false (N2-F01).

[E13: Volgistics Schedule Overview](https://www.volgistics.com/help/schedule/schedule-overview/); [E14: Volgistics Add Schedule Openings](https://www.volgistics.com/help/schedule/add-schedule-openings/); [E15: Volgistics Edit a Schedule Opening](https://www.volgistics.com/help/schedule/edit-a-schedule-opening/); [E16: Volgistics Edit/Remove Schedule Entry](https://www.volgistics.com/help/schedule/edit-a-schedule-entry-or-remove-a-scheduled-volunteer/)

**P2 — Assign the first available volunteer alphabetically.** [final.md:72](/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M02-B/control/reviser/final.md:72) (lines 72).

Disposition: Reject production alphabetical allocation; optional tie-break. Reasoned policy correction, not a claim that all name-order outcomes were measured. Uneven opportunity, skills, preferences and history are investigated; no equal-availability assumption.

[E22: OR-Tools v9.15 implementation](https://github.com/google/or-tools/blob/551ad10d94835c99e5e1e684500d3db398c0e345/examples/python/shift_scheduling_sat.py); [E29: Timefold Managed Fairness](https://docs.timefold.ai/employee-shift-scheduling/1.35.x/employee-resource-constraints/fairness/balance-time-worked); [E33: Timefold fairness patch](https://github.com/TimefoldAI/timefold-quickstarts/commit/77b1c335ce47c2026ba2873a646582cfbc091d58.patch)

**P3 — Allow coordinators to swap names.** [final.md:73](/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M02-B/control/reviser/final.md:73) (lines 73).

Disposition: Retain with checks/audit/notifications; volunteer swaps open. Legitimate elaboration of coordinator intervention. Bounded vendor permissions support the role model; atomicity/consent/history are proposed acceptance conditions, not established vendor behavior.

[E13: Volgistics Schedule Overview](https://www.volgistics.com/help/schedule/schedule-overview/)

**P4 — Email everyone the full roster.** [final.md:74](/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M02-B/control/reviser/final.md:74) (lines 74).

Disposition: Reject default full-roster email; audience/name policy decision. Direct response to privacy-limited sharing. Peer name hiding is correctly used as an alternative example, not a legal mandate or universal access guarantee.

[E19: Volgistics Privacy](https://www.volgistics.com/help/vicnet-portal/volunteer-privacy-settings/); [E07: Better Impact Volunteer Impact](https://www.betterimpact.com/solutions-volunteer-impact?hsCtaAttrib=171143047728)

**P5 — Use local wall-clock timestamps.** [final.md:75](/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M02-B/control/reviser/final.md:75) (lines 75).

Disposition: Conditional correction of unzoned fixed timestamps; preserve civil recurrence with zone. Avoids treating all local times as wrong. RFC gap/fold/recurrence distinction is accurate; interchange, application zone database and operational coverage policy remain separate.

[E39: RFC 5545](https://www.rfc-editor.org/rfc/rfc5545.html)

**P6 — Test one ordinary week.** [final.md:76](/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M02-B/control/reviser/final.md:76) (lines 76, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125).

Disposition: Retain ordinary week as smoke test; enhance coverage. Appropriate enhancement for explicit brief constraints; does not claim original P6 forbids further tests or that the matrix has run.

[E22: OR-Tools v9.15 implementation](https://github.com/google/or-tools/blob/551ad10d94835c99e5e1e684500d3db398c0e345/examples/python/shift_scheduling_sat.py); [E29: Timefold Managed Fairness](https://docs.timefold.ai/employee-shift-scheduling/1.35.x/employee-resource-constraints/fairness/balance-time-worked); [E39: RFC 5545](https://www.rfc-editor.org/rfc/rfc5545.html); [E40: WCAG 2.2](https://www.w3.org/TR/2024/REC-WCAG22-20241212/)

#### Evidence-backed treatment of every criticism

**M01 — Accept narrow object/permission distinction; reject the final's broader absence claim.** Regular volunteer entries are not opening templates and the one-date remove/re-add workaround proves no first-class opening exception. Coordinator opening restrictions are real. But the cited overview documents recurring openings; administrator recurrence/change is not absent research. Final over-broadening is N2-F01.

Final [final.md:10](/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M02-B/control/reviser/final.md:10); affected lines 10, 40, 71, 127. [E13: Volgistics Schedule Overview](https://www.volgistics.com/help/schedule/schedule-overview/); [E14: Volgistics Add Schedule Openings](https://www.volgistics.com/help/schedule/add-schedule-openings/); [E15: Volgistics Edit a Schedule Opening](https://www.volgistics.com/help/schedule/edit-a-schedule-opening/); [E16: Volgistics Edit/Remove Schedule Entry](https://www.volgistics.com/help/schedule/edit-a-schedule-entry-or-remove-a-scheduled-volunteer/)

**m01 — Accept precision/conditional scope.** Fixed unzoned time differs from intended civil recurrence. Gap DATE-TIME and recurrence-generated gap have different RFC semantics, now explicitly preserved.

Final [final.md:11](/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M02-B/control/reviser/final.md:11); affected lines 11, 75, 119. [E39: RFC 5545](https://www.rfc-editor.org/rfc/rfc5545.html)

**m02 — Accept standards-scope clarification.** RFC TZID/interchange is not an application's mandated IANA database policy; receiving-calendar validation stays conditional.

Final [final.md:12](/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M02-B/control/reviser/final.md:12); affected lines 12, 75, 119. [E39: RFC 5545](https://www.rfc-editor.org/rfc/rfc5545.html)

**m03 — Accept example precision.** Pinned OR-Tools sample includes Off in exactly-one; minimum work demand is separate. It is not a rule that every volunteer works each day.

Final [final.md:13](/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M02-B/control/reviser/final.md:13); affected lines 13, 51. [E22: OR-Tools v9.15 implementation](https://github.com/google/or-tools/blob/551ad10d94835c99e5e1e684500d3db398c0e345/examples/python/shift_scheduling_sat.py)

**m04 — Retain supported chain and boundaries.** Issue/merged quickstart/cast fix links and patches support the evolution. No runtime, production incident or universal fairness policy is inferred.

Final [final.md:14](/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M02-B/control/reviser/final.md:14); affected lines 14, 65. [E31: Timefold Fairness Evolution](https://github.com/TimefoldAI/timefold-quickstarts/issues/492); [E32: Timefold quickstart PR](https://github.com/TimefoldAI/timefold-quickstarts/pull/517); [E33: Timefold fairness patch](https://github.com/TimefoldAI/timefold-quickstarts/commit/77b1c335ce47c2026ba2873a646582cfbc091d58.patch); [E34: Timefold cast fix PR](https://github.com/TimefoldAI/timefold-solver/pull/980); [E35: Timefold cast patch](https://github.com/TimefoldAI/timefold-solver/commit/d6546cc9720df0578c67ec91956ca7a46eaf36c8.patch)

#### Discovery/draft/critique/final preservation

Complete reading of discovery, draft, critique, final, stage source maps/indexes, and all unique source-note bodies; duplicated inherited notes verified byte-identical.

- **Products and operating approaches — Preserved:** Both suites, coordinator management, self-signup, CP-SAT, open-source Solver and distinct hosted model remain substantive alternatives (final37–47). Volgistics opening scope is newly over-narrowed (F01).
- **Hard/soft model and changing availability — Preserved and clarified:** Availability versus preference/commitment, skills, coverage shortages, source applicability and Off modeling survive (24–29,51–53,72).
- **Fairness alternatives — Preserved:** Count, duration, opportunity-normalization, preference and coverage-first measures retain cohort/window/unequal-availability caveats (57–65).
- **Evolution evidence — Preserved:** Issue, implementation and required cast fix remain a bounded public evolution chain, without production/performance inference (14,65).
- **Recurrence and timestamp conditions — Mixed:** Opening versus volunteer-entry distinction improves precision, and RFC gap/fold/recurrence distinction is repaired. False wider absence claim enters final10/40; P1 remains retained.
- **Mobile, reminders, accessibility and privacy — Preserved:** App versus coordinator browser, audience controls, opt-in/channel decisions and optional web target remain prose and test cases (87–91,121–124).
- **Imports — Preserved:** Vendor restrictions plus proposed identity/date/consent staging, batch history and repeated-import decisions survive (95–106,123).
- **Validation, decisions and unknowns — Preserved:** Original smoke week and discriminator matrix are retained; all tests remain proposals and unknown pricing/data/policy inputs stay unresolved (108–135).

The final is substantive self-contained prose, not an ID list. Material distortion/omission is adjudicated separately from retained useful branches, options and honest uncertainty.

#### Meaningful proposed versus executed validation

**Proposed:** Ordinary week, scarce qualified coverage, absence/preference/overlap, unequal-opportunity fairness, series change/exception/history, distinct DST inputs, swap/cancellation, scoped roster privacy, channel opt-out/timing/content, invalid/duplicate import, accessible mobile tasks, identical vendor scenarios.

**Claimed executed:** Only document/source/code/release inspection is claimed. No candidate runtime, trial, solver, import, API, delivery, performance or accessibility witness.

**Discriminators and oracles:** Shortages must show gaps rather than forced invalid assignments; preferences and hard absences differ; policy/cohort changes expose fairness denominator effects; one-date edits must not mutate neighbors; audience and consent variation reveal disclosure failures. RFC provides a primary oracle for the two different gap input types. Import tests include no/multiple identity matches rather than successful rows only.

**Judgment:** Meaningful proposed validation, no validation overclaim. Most expected results depend on selected product policy and correctly remain acceptance proposals. Source inspection establishes mechanisms, not system behavior. [E16: Volgistics Edit/Remove Schedule Entry](https://www.volgistics.com/help/schedule/edit-a-schedule-entry-or-remove-a-scheduled-volunteer/); [E22: OR-Tools v9.15 implementation](https://github.com/google/or-tools/blob/551ad10d94835c99e5e1e684500d3db398c0e345/examples/python/shift_scheduling_sat.py); [E29: Timefold Managed Fairness](https://docs.timefold.ai/employee-shift-scheduling/1.35.x/employee-resource-constraints/fairness/balance-time-worked); [E39: RFC 5545](https://www.rfc-editor.org/rfc/rfc5545.html); [E40: WCAG 2.2](https://www.w3.org/TR/2024/REC-WCAG22-20241212/)

No runnable target/data/account supplied; the brief explicitly accepts honest no-runtime evidence. No test is upgraded because source code or JSON parses.

#### Minor findings

**N2-m01 — Disposition precision.** P1's added timezone/exception/history semantics and P6's larger matrix are mainly elaborations beyond a thin plan; 'correction' can overstate what the original sentence asserted. The final retains both original capabilities and makes decisions/conditions explicit, so this wording is not an independent material rejection.

Candidate passages: [final.md:71](/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M02-B/control/reviser/final.md:71) (lines 71, 75, 76).

#### Complete consequential primary-claim coverage

Every cluster below was independently checked. Related statements are grouped by mechanism and applicability; their counts are not grades. Remaining reviewer claim scope: **none**. This does not certify a live product or target application.

**N2-C01 — Volgistics recurrence/object applicability and claimed lack of documented opening recurrence.**

Candidate [final.md:10](/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M02-B/control/reviser/final.md:10) (lines 10, 40, 71). MATERIAL DEFECT N2-F01: the entry/opening distinction is sound, but the blanket absence claim contradicts the cited overview and related opening guides.

[E13: Volgistics Schedule Overview](https://www.volgistics.com/help/schedule/schedule-overview/); [E14: Volgistics Add Schedule Openings](https://www.volgistics.com/help/schedule/add-schedule-openings/); [E15: Volgistics Edit a Schedule Opening](https://www.volgistics.com/help/schedule/edit-a-schedule-opening/); [E16: Volgistics Edit/Remove Schedule Entry](https://www.volgistics.com/help/schedule/edit-a-schedule-entry-or-remove-a-scheduled-volunteer/)

**N2-C02 — Better Impact recurring signup, mobile access and communications.**

Candidate [final.md:39](/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M02-B/control/reviser/final.md:39) (lines 39, 87). Supported as vendor-described capability; coordinator browser versus volunteer app correctly separated. Actual reminders, consent and target accessibility remain untested.

[E07: Better Impact Volunteer Impact](https://www.betterimpact.com/solutions-volunteer-impact?hsCtaAttrib=171143047728); [E08: Better Impact mobile help](https://siteguide.betterimpact.com/en/articles/9893058-navigating-the-app-and-mobile-interface)

**N2-C03 — Volgistics self-scheduling is optional, disabled initially, service/configuration gated.**

Candidate [final.md:40](/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M02-B/control/reviser/final.md:40) (lines 40, 42, 81). Supported. Optional controls and workflow are distinguished from an optimizer and from guaranteed coverage.

[E17: Volgistics Self-scheduling](https://www.volgistics.com/help/schedule/getting-started-with-self-scheduling/); [E18: Volgistics Self-scheduling Settings](https://www.volgistics.com/help/schedule/self-scheduling-settings-for-vicnet-and-victouch/)

**N2-C04 — Managed Timefold weights/default levels.**

Candidate [final.md:45](/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M02-B/control/reviser/final.md:45) (lines 45, 53). Supported for 1.35.x; defaults 1 and cap 10^12 are scoped to this managed model rather than all Timefold.

[E30: Timefold Managed Constraints](https://docs.timefold.ai/employee-shift-scheduling/1.35.x/user-guide/constraints)

**N2-C05 — Managed Timefold FTE range, precision, tag defaults, 100*SD metric, cohort/window.**

Candidate [final.md:45](/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M02-B/control/reviser/final.md:45) (lines 45, 61, 63). Supported. Employee FTE and eligibility/history assumptions are explicitly not imposed on unequal-availability volunteers.

[E29: Timefold Managed Fairness](https://docs.timefold.ai/employee-shift-scheduling/1.35.x/employee-resource-constraints/fairness/balance-time-worked)

**N2-C06 — OR-Tools Boolean assignment and exactly-one including Off.**

Candidate [final.md:13](/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M02-B/control/reviser/final.md:13) (lines 13, 43, 51). Supported by pinned code; distinction from employee documentation's at-most-one work shift is made explicit.

[E21: OR-Tools Employee Scheduling](https://developers.google.com/optimization/scheduling/employee_scheduling?hl=en); [E22: OR-Tools v9.15 implementation](https://github.com/google/or-tools/blob/551ad10d94835c99e5e1e684500d3db398c0e345/examples/python/shift_scheduling_sat.py); [E23: OR-Tools v9.15 Release](https://github.com/google/or-tools/releases/tag/v9.15)

**N2-C07 — Demand as lower bound/excess penalty, hard/soft boundaries and feasible/optimal.**

Candidate [final.md:43](/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M02-B/control/reviser/final.md:43) (lines 43, 51, 53). Supported by sample. Proposal to select hard eligibility and staffing policy is not presented as the sample's universal/default rule.

[E22: OR-Tools v9.15 implementation](https://github.com/google/or-tools/blob/551ad10d94835c99e5e1e684500d3db398c0e345/examples/python/shift_scheduling_sat.py)

**N2-C08 — Timefold shift-count fairness, zero-assignment cohort and decimal scoring.**

Candidate [final.md:44](/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M02-B/control/reviser/final.md:44) (lines 44, 57, 65). Supported by implementation patch; example tests demonstrate an implemented score, not an independently executed witness or appropriate volunteer policy.

[E31: Timefold Fairness Evolution](https://github.com/TimefoldAI/timefold-quickstarts/issues/492); [E32: Timefold quickstart PR](https://github.com/TimefoldAI/timefold-quickstarts/pull/517); [E33: Timefold fairness patch](https://github.com/TimefoldAI/timefold-quickstarts/commit/77b1c335ce47c2026ba2873a646582cfbc091d58.patch)

**N2-C09 — Issue492→PR517→required Solver PR980/cast patch/v1.13 milestone evolution.**

Candidate [final.md:14](/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M02-B/control/reviser/final.md:14) (lines 14, 65). Supported by public linked records and code. Milestone is accurately bounded, not claimed as proof of a deployed production incident.

[E31: Timefold Fairness Evolution](https://github.com/TimefoldAI/timefold-quickstarts/issues/492); [E32: Timefold quickstart PR](https://github.com/TimefoldAI/timefold-quickstarts/pull/517); [E33: Timefold fairness patch](https://github.com/TimefoldAI/timefold-quickstarts/commit/77b1c335ce47c2026ba2873a646582cfbc091d58.patch); [E34: Timefold cast fix PR](https://github.com/TimefoldAI/timefold-solver/pull/980); [E35: Timefold cast patch](https://github.com/TimefoldAI/timefold-solver/commit/d6546cc9720df0578c67ec91956ca7a46eaf36c8.patch)

**N2-C10 — RFC floating/zoned, repeated-hour, gap DATE-TIME versus RRULE gap, interchange scope.**

Candidate [final.md:11](/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M02-B/control/reviser/final.md:11) (lines 11, 12, 75, 119). Supported and materially more precise than the draft. The RFC does not prescribe application tzdb or the food bank's gap policy.

[E39: RFC 5545](https://www.rfc-editor.org/rfc/rfc5545.html)

**N2-C11 — Volgistics peer-name hiding and configurable sharing.**

Candidate [final.md:40](/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M02-B/control/reviser/final.md:40) (lines 40, 74, 89, 121). Supported; filled status can remain visible. Final does not incorrectly import Better Impact's non-override rule into Volgistics.

[E19: Volgistics Privacy](https://www.volgistics.com/help/vicnet-portal/volunteer-privacy-settings/)

**N2-C12 — Coordinator schedule-entry rights and group/assignment scope.**

Candidate [final.md:40](/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M02-B/control/reviser/final.md:40) (lines 40, 41, 73). Supported as configurable coordinator rights; should not be generalized to administrator inability to configure openings (N2-F01).

[E13: Volgistics Schedule Overview](https://www.volgistics.com/help/schedule/schedule-overview/)

**N2-C13 — Volgistics regular volunteer entry ending dates and one-date remove/re-add.**

Candidate [final.md:71](/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M02-B/control/reviser/final.md:71) (lines 71). Supported for the entry object. Properly retained as an illustration with bounded applicability.

[E16: Volgistics Edit/Remove Schedule Entry](https://www.volgistics.com/help/schedule/edit-a-schedule-entry-or-remove-a-scheduled-volunteer/)

**N2-C14 — Volgistics caps and 1–12 month/fixed-date booking window.**

Candidate [final.md:81](/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M02-B/control/reviser/final.md:81) (lines 81). Supported; caps do not restrict operator/coordinator assignment and are offered as optional enhancement.

[E18: Volgistics Self-scheduling Settings](https://www.volgistics.com/help/schedule/self-scheduling-settings-for-vicnet-and-victouch/)

**N2-C15 — WCAG2.2AA proposed web target, keyboard/reflow/touch checks and separate messages.**

Candidate [final.md:91](/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M02-B/control/reviser/final.md:91) (lines 91, 124). Supported in web scope, with exceptions and chosen target distinguished from legal mandate, SMS conformance or completed audit.

[E40: WCAG 2.2](https://www.w3.org/TR/2024/REC-WCAG22-20241212/)

**N2-C16 — Better Impact XLSX/UserData, ordered columns, regional dates and fees.**

Candidate [final.md:95](/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M02-B/control/reviser/final.md:95) (lines 95). Supported. Import/update fitness correctly left subject to the actual staff-assisted process and quote.

[E04: Better Impact Profile Import](https://support.betterimpact.com/en/articles/8368729-importing-user-profiles)

**N2-C17 — Volgistics new-record import, pending receipt, mapping preview/warnings.**

Candidate [final.md:95](/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M02-B/control/reviser/final.md:95) (lines 95). Supported by import guide. Generic staged-update proposal is not misrepresented as built-in update behavior.

[E20: Volgistics Import](https://www.volgistics.com/help/volunteer-records/import-volunteer-records/)

**N2-C18 — Hybrid workflow, alphabetical-order risk, swap/audit and audience-limited roster policy.**

Candidate [final.md:24](/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M02-B/control/reviser/final.md:24) (lines 24, 25, 26, 27, 28, 29, 72, 73, 74). Brief-grounded proposals/inferences, not measured product outcomes. No equal-availability or statutory premise. Alphabetical priority conflicts with the requested fairness investigation but can remain a bounded tie-break.

Original brief and explicit design inference; no external result asserted.

**N2-C19 — Count/minutes/opportunity-normalized/preferences/coverage-first fairness alternatives.**

Candidate [final.md:57](/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M02-B/control/reviser/final.md:57) (lines 57, 58, 59, 60, 61, 63). Meaningful optional mechanisms with cohort/window/denominator decisions preserved. No claim that unequal totals alone establish inequity; zero-load treatment matters as shown by the source implementation.

[E29: Timefold Managed Fairness](https://docs.timefold.ai/employee-shift-scheduling/1.35.x/employee-resource-constraints/fairness/balance-time-worked); [E33: Timefold fairness patch](https://github.com/TimefoldAI/timefold-quickstarts/commit/77b1c335ce47c2026ba2873a646582cfbc091d58.patch)

**N2-C20 — Identity/date/consent import staging, source of truth, batches and retention.**

Candidate [final.md:99](/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M02-B/control/reviser/final.md:99) (lines 99, 100, 101, 102, 103, 104, 106). Proposed operating requirements, not executed import guarantees. Fits occasional import scope without asserting a legal retention period.

[E04: Better Impact Profile Import](https://support.betterimpact.com/en/articles/8368729-importing-user-profiles); [E20: Volgistics Import](https://www.volgistics.com/help/volunteer-records/import-volunteer-records/)

**N2-C21 — Validation discriminates shortage, preference, series edit, DST, swap, privacy, reminders, import and accessibility.**

Candidate [final.md:114](/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M02-B/control/reviser/final.md:114) (lines 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 135). Meaningful proposed tests; no observed results promoted to proof. Vendor comparison uses identical synthetic scenarios and records configuration/manual workarounds.

[E13: Volgistics Schedule Overview](https://www.volgistics.com/help/schedule/schedule-overview/); [E16: Volgistics Edit/Remove Schedule Entry](https://www.volgistics.com/help/schedule/edit-a-schedule-entry-or-remove-a-scheduled-volunteer/); [E22: OR-Tools v9.15 implementation](https://github.com/google/or-tools/blob/551ad10d94835c99e5e1e684500d3db398c0e345/examples/python/shift_scheduling_sat.py); [E29: Timefold Managed Fairness](https://docs.timefold.ai/employee-shift-scheduling/1.35.x/employee-resource-constraints/fairness/balance-time-worked); [E39: RFC 5545](https://www.rfc-editor.org/rfc/rfc5545.html); [E40: WCAG 2.2](https://www.w3.org/TR/2024/REC-WCAG22-20241212/)

#### Honest unresolved inputs and grade boundaries

- **External product inputs:** Actual vendor plan/quote, account configuration, target tasks, data terms, end-to-end import/reminder/accessibility and live series exceptions were not exercised. These honest unknowns are not treated as reviewer gaps or factual failures.
- **User policy:** Staffing minimum versus target, availability versus acceptance, fairness cohort/metric/weights, peer-name audience, channels, template horizon and published-change policy remain food-bank decisions.
- **Empirical applicability:** No 180-volunteer dataset or runtime target; no optimizer quality/latency, independent source regression rerun, or compliance/delivery result established.

- Static independent assessment against the original small brief and frozen plan.
- Vendor documentation is mutable and has no captured software deployment release; live behavior remains unverified.
- Material finding is specific; other supported work is not erased by FAIL.
- No scalar quality equality, ranking, speed win, runtime result or cost comparison follows from this grade.

### N1 (treatment) — FAIL

Independent material recurrence finding N1-F01; other axes and available evidence were reviewed fully. This is not a score inferred from citations, agreement, or hashes.

#### All six rubric axes

**1. Original obligations and explicit constraints.** Original scope is addressed throughout; central available recurrence investigation fails O2 and affects O4/O5. Other constraints/options are retained; production guarantees are not invented as grading requirements.

Actual coverage: {"status": "FULL", "obligations": ["O1", "O2", "O3", "O4", "O5", "O6"], "constraints": ["180 volunteers", "changing availability", "recurring shifts", "predictable coverage", "mobile access", "accessible reminders", "privacy-limited sharing", "occasional imported rosters", "no invented law", "no equal availability"]}.

**2. Consequential primary facts, defaults, units, versions and applicability.** Material recurrence defect N1-F01. Other selected product defaults, solver semantics, fairness mechanisms, standards and release applicability are supported or explicitly externally unresolved. See claim-by-claim checks rather than source-count inference.

Actual coverage: {"status": "FULL for relevant consequential claim clusters", "checked_claim_ids": ["N1-C01", "N1-C02", "N1-C03", "N1-C04", "N1-C05", "N1-C06", "N1-C07", "N1-C08", "N1-C09", "N1-C10", "N1-C11", "N1-C12", "N1-C13", "N1-C14", "N1-C15", "N1-C16", "N1-C17", "N1-C18", "N1-C19", "N1-C20", "N1-C21", "N1-C22"], "remaining_claim_ids": []}.

**3. Meaningful unfamiliar discovery and optional alternatives.** Substantive different product/workflow/mechanism routes survive with tradeoffs and policy choices. Roster size does not force optimization. Recurrence understatement/omission is accounted under F01, without erasing the useful discovery.

Actual coverage: {"status": "FULL", "stages": ["discovery", "draft", "final"], "options": ["Better Impact", "VolunteerLocal", "CP-SAT", "restricted Google API", "custom Timefold", "managed Timefold", "no fairness automation", "multiple fairness measures"]}.

**4. Every exact plan clause and disposition.** All six clauses are independently adjudicated. P2/P4 rejection responds to the brief; P3 retention and P6 enlargement are reasonable; P5 preserves intended local civil time with qualified representation. P1 is retained but its product evidence is defective. Added semantics are not treated as facts asserted by the thin plan.

Actual coverage: {"status": "FULL", "clauses": ["P1", "P2", "P3", "P4", "P5", "P6"]}.

**5. Draft/critique/final preservation and fallible criticism.** Full prose preserves/expands fairness and workflow options; M2–M6 are supported refinements or retained evidence, not proof the draft had six independent defects. M1 misses Shift Template evidence; minor concrete constraint compression is separately recorded.

Actual coverage: {"status": "FULL", "stages": ["complete discovery", "complete draft", "complete critique", "complete final", "stage source maps", "stage source indexes/notes"], "critic_items": ["M1", "M2", "M3", "M4", "M5", "M6"], "unread_stage_scope": []}.

**6. Meaningful proposed versus executed validation.** Proposed tests discriminate consequential failures and policies; none is claimed executed. Versioned source regression assertions support an implementation/evolution chain without establishing target behavior or a runtime witness.

Actual coverage: {"status": "FULL", "matrix": "all rows and surrounding execution statements read", "independent_oracles": "source semantics checked where claimed; selected-policy acceptance outcomes remain proposals"}.

#### Original obligations O1–O6

- **O1 — Satisfied:** Better Impact, event/job-oriented VolunteerLocal, CP-SAT, restricted Google hosted API, custom/managed Timefold and no-optimization pilot are useful unfamiliar alternatives.
- **O2 — Material defect:** Relevant units/defaults/domain and version checks were substantially performed, but central available recurrence evidence is mischaracterized or omitted. General uncertainty does not excuse that specific available research.
- **O3 — Satisfied with static-source limits:** Custom temporary-score restoration fix/tests→merged revision→v2.6.0 release and separate v2.7.1 performance change are supported and conditionally applicable.
- **O4 — All six clauses covered; P1 evidence defect:** Every exact P sentence is retained in the candidate comparison. Retention, rejection, enhancement, open decisions and uncertainty are distinguished in substance. P1 source characterization remains defective; no wholesale false rejection of weekly recurrence is inferred.
- **O5 — Broad preservation with core recurrence omission and minor compression:** Final is full standalone prose, not an ID list. Supported alternatives, uneven availability, privacy/reminder/import/mobile conditions and most critic qualifications remain visible. The recurrence evidence/criticism issue prevents full quality; remaining preservation details are itemized.
- **O6 — Satisfied; proposals not executed:** Synthetic scenarios distinguish policy, constraint and product behaviors. Literature/code inspection is separated from runtime, imports, message delivery and accessibility results. No execution was required or fabricated.

#### Every exact P disposition

**P1 — Generate recurring shifts from a weekly template.** [final.md:43](/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M02-B/treatment/reviser/final.md:43) (lines 43, 45, 47, 49, 51, 53).

Disposition: Retain candidate workflow; semantics and capability checks. No unjustified wholesale rejection. Material available evidence is omitted (N1-F01); a hypothetical perpetual autonomous generator is not the frozen requirement.

[E01: Better Impact Activities](https://support.betterimpact.com/en/articles/8780736-comprehensive-guide-to-activities); [E09: VolunteerLocal Jobs & Shifts](https://www.volunteerlocal.com/features/jobs-shifts)

**P2 — Assign the first available volunteer alphabetically.** [final.md:55](/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M02-B/treatment/reviser/final.md:55) (lines 55, 57, 59, 61, 63, 65, 67, 69, 71).

Disposition: Reject alphabetical allocation; retain bounded tie-breaking possibilities; choose policy. Reasoned fairness/coverage response. Explicit mandatory mapping fixes real default-policy risk, while availability versus consent and no optimization remain valid alternatives.

[E22: OR-Tools v9.15 implementation](https://github.com/google/or-tools/blob/551ad10d94835c99e5e1e684500d3db398c0e345/examples/python/shift_scheduling_sat.py); [E25: Google solveShiftScheduling REST](https://developers.google.com/optimization/service/reference/rest/v1/scheduling/solveShiftScheduling); [E27: Timefold Solver Fairness](https://docs.timefold.ai/timefold-solver/latest/constraints-and-score/load-balancing-and-fairness); [E29: Timefold Managed Fairness](https://docs.timefold.ai/employee-shift-scheduling/1.35.x/employee-resource-constraints/fairness/balance-time-worked)

**P3 — Allow coordinators to swap names.** [final.md:74](/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M02-B/treatment/reviser/final.md:74) (lines 74, 76, 78, 80, 82, 84).

Disposition: Retain; revalidate, accept/commit atomically, notify; overrides open. Appropriate safeguards and decisions, supported as design proposals. Pinning versus change cost is correctly separated.

[E02: Better Impact Scheduling](https://support.betterimpact.com/en/articles/13192494-comprehensive-guide-to-scheduling); [E28: Timefold Replanning](https://docs.timefold.ai/timefold-solver/latest/responding-to-change/non-disruptive-replanning)

**P4 — Email everyone the full roster.** [final.md:86](/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M02-B/treatment/reviser/final.md:86) (lines 86, 88, 90, 92, 94, 96, 98).

Disposition: Reject unconditional full-roster email; decide same-shift/broader audiences. Privacy-limited sharing retained without invented law; anonymity control does not prove complete authentication/forwarding safety.

[E02: Better Impact Scheduling](https://support.betterimpact.com/en/articles/13192494-comprehensive-guide-to-scheduling); [E12: VolunteerLocal No Password](https://www.volunteerlocal.com/features/no-password-required)

**P5 — Use local wall-clock timestamps.** [final.md:100](/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M02-B/treatment/reviser/final.md:100) (lines 100, 102, 104, 106, 108).

Disposition: Revise representation; preserve local recurrence plus zone/instant; update policy open. Correct conditional enhancement. Named civil rule and occurrence instant solve different purposes; future zone-rule changes legitimately require a product decision.

[E26: Google DateTime](https://developers.google.com/optimization/service/reference/rest/v1/DateTime)

**P6 — Test one ordinary week.** [final.md:110](/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M02-B/treatment/reviser/final.md:110) (lines 110, 112, 114, 116, 118).

Disposition: Keep ordinary-week smoke; add discriminating cases. Supported expanded validation, not an empirical promise or inappropriate rejection of ordinary testing.

[E25: Google solveShiftScheduling REST](https://developers.google.com/optimization/service/reference/rest/v1/scheduling/solveShiftScheduling); [E26: Google DateTime](https://developers.google.com/optimization/service/reference/rest/v1/DateTime); [E27: Timefold Solver Fairness](https://docs.timefold.ai/timefold-solver/latest/constraints-and-score/load-balancing-and-fairness); [E40: WCAG 2.2](https://www.w3.org/TR/2024/REC-WCAG22-20241212/)

#### Evidence-backed treatment of every criticism

**M1 — Partially accept distinction; reject omission of available Shift Template evidence.** Enterprise Activity Templates are distinct and do not alone prove recurrence. However, the same guide directly documents Weekly Shift Templates, multi-shift creation and non-propagating template edits. Frozen P1 does not demand perpetual unattended expansion. N1-F01 is a source omission rather than a blanket claim that every exception behavior is documented.

Final [final.md:47](/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M02-B/treatment/reviser/final.md:47); affected lines 47, 124, 135. [E01: Better Impact Activities](https://support.betterimpact.com/en/articles/8780736-comprehensive-guide-to-activities); [E09: VolunteerLocal Jobs & Shifts](https://www.volunteerlocal.com/features/jobs-shifts)

**M2 — Accept explicit implementation mapping; defaults already present in draft.** Default medium/low fields can soften intended hard policy; final explicitly sets mandatory and rejects unsuccessful/empty output. This is a useful connection, not proof that draft incorrectly stated defaults or that a solver was run.

Final [final.md:35](/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M02-B/treatment/reviser/final.md:35); affected lines 35, 125, 139, 140. [E25: Google solveShiftScheduling REST](https://developers.google.com/optimization/service/reference/rest/v1/scheduling/solveShiftScheduling)

**M3 — Accept finer audience distinction as refinement.** Rejecting unconditional broad email is appropriate. Same-shift peers, coordinators and wider audiences are separate user decisions; source privacy control is accurately limited to peer-name visibility.

Final [final.md:90](/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M02-B/treatment/reviser/final.md:90); affected lines 90, 92, 94, 96, 98, 126, 143, 144. [E02: Better Impact Scheduling](https://support.betterimpact.com/en/articles/13192494-comprehensive-guide-to-scheduling); [E12: VolunteerLocal No Password](https://www.volunteerlocal.com/features/no-password-required)

**M4 — Accept missing policy/test case as enhancement.** DateTime explicitly warns that stored future civil dates may be affected by zone changes. It does not dictate published/unpublished handling; final preserves the decision and proposes a discriminator.

Final [final.md:102](/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M02-B/treatment/reviser/final.md:102); affected lines 102, 104, 106, 127, 136. [E26: Google DateTime](https://developers.google.com/optimization/service/reference/rest/v1/DateTime)

**M5 — Accept actual-message oracle and scope.** Brief explicitly requires accessible reminders. Final inspects actual message content/actions rather than only a web screen and keeps HTML criteria separate from SMS content and law.

Final [final.md:128](/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M02-B/treatment/reviser/final.md:128); affected lines 128, 144, 145, 146. [E40: WCAG 2.2](https://www.w3.org/TR/2024/REC-WCAG22-20241212/)

**M6 — Retain supported chain with applicability limits.** Actual diff/test assertions and release inclusion support the score-restoration defect and change; custom-path scope and independent-reproduction absence are accurately retained.

Final [final.md:129](/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M02-B/treatment/reviser/final.md:129); affected lines 129, 168, 170. [E36: Timefold Score Restoration PR](https://github.com/TimefoldAI/timefold-solver/pull/2596); [E37: Timefold 2.6.0 Release](https://github.com/TimefoldAI/timefold-solver/releases/tag/v2.6.0); [E38: Timefold 2.7.1 Release](https://github.com/TimefoldAI/timefold-solver/releases/tag/v2.7.1)

#### Discovery/draft/critique/final preservation

Complete reading of discovery, draft, critique, final, all six assigned stage inputs and source maps/indexes, and all unique source-note bodies; inherited duplicate notes verified byte-identical.

- **Product and implementation options — Preserved/expanded:** Suite signup, event/job product, CP-SAT, restricted API, custom/managed Solver and no-automation pilot appear in full prose (29–37,152–164).
- **Hard/soft mapping and availability/consent — Preserved and sharpened:** Explicit mandatory serialization and status checks connect existing API defaults to chosen hard policy. Availability does not equal accepted commitment (23–35,55–71).
- **Fairness options and precision — Preserved:** Discovery's counts/hours/effort/opportunity/undesirable work and no-optimizer routes are expanded beyond the thinner draft. Dataset precision, tiny denominator, zero assignments and retuning remain explicit (27,33,162).
- **Vendor constraints/defaults — Minor compression:** Exact per-shift restrictions, auto-confirm default and tier names disappear into generic capability/configuration checks (N1-m01); no contrary capability is asserted.
- **Recurrence and critiques — Material omission in adjudication:** Enterprise distinction is introduced as a corrective premise while available Shift Template creation/non-propagation evidence is unreported (F01). Stable IDs and broader exceptions correctly remain proposals.
- **Published changes and zones — Preserved/expanded:** Pinning versus cost, atomic swaps and confirmation survive; future tzdb/site-zone decisions and tests are added (37,74–84,100–108,127,136,142).
- **Privacy, mobile, imports and reminders — Preserved/expanded:** Peer anonymity, channel/link unknowns and import format/cost caveats remain; actual email/SMS audience/content checks are added alongside mobile web checks (31,39,86–98,143–147,164).
- **Evolution, validation and limitations — Preserved:** Custom score fix/release chain, separate performance release and lack of independent reproduction persist; all fourteen rows are proposed, not run (129–182).

The final is substantive self-contained prose, not an ID list. Material distortion/omission is adjudicated separately from retained useful branches, options and honest uncertainty.

#### Meaningful proposed versus executed validation

**Proposed:** Fourteen rows cover recurrence; DST/zone updates; eligibility; overlap/capacity; name-order/mandatory serialization; shortage/status; swap; pinning/stability; audiences/links; reminder privacy; actual reminder accessibility; mobile/assistive tasks; bad imports; fairness cohort diagnostics.

**Claimed executed:** Literature/source inspection only. The candidate explicitly denies solver output, trial, import, integration, accessibility and delivery tests.

**Discriminators and oracles:** Serialized hard-rule priorities and empty/non-feasible response handling distinguish default softening from chosen hard policy. Unequal-availability and reordered-name cases reveal policy dependence. Swaps test ineligibility and unaccepted offers; forwarded links/shared devices probe audience assumptions. Reminder content is examined separately from portal UI. Source regression assertions distinguish temporary score from restored value/score, including failure path, but are not independently rerun.

**Judgment:** Meaningful proposals with explicit oracles; no validation overclaim. Recurrence test framing inherits F01's available-research omission, but unexecuted live-product questions themselves remain honest. [E01: Better Impact Activities](https://support.betterimpact.com/en/articles/8780736-comprehensive-guide-to-activities); [E25: Google solveShiftScheduling REST](https://developers.google.com/optimization/service/reference/rest/v1/scheduling/solveShiftScheduling); [E26: Google DateTime](https://developers.google.com/optimization/service/reference/rest/v1/DateTime); [E27: Timefold Solver Fairness](https://docs.timefold.ai/timefold-solver/latest/constraints-and-score/load-balancing-and-fairness); [E28: Timefold Replanning](https://docs.timefold.ai/timefold-solver/latest/responding-to-change/non-disruptive-replanning); [E36: Timefold Score Restoration PR](https://github.com/TimefoldAI/timefold-solver/pull/2596); [E40: WCAG 2.2](https://www.w3.org/TR/2024/REC-WCAG22-20241212/)

No target application/account/data is available. Static regression inspection does not establish a deployment, 180-volunteer latency or accessibility conformance.

#### Minor findings

**N1-m01 — Preservation compression.** The final's generic per-shift/plan checks lose the concrete no per-shift leader/location/note and no volunteer signup-count cap findings, the auto-confirm-on default, and Growth/Impact versus Foundation distinction. These are source-supported discovery constraints. I classify the compression as minor here because the final neither asserts these capabilities nor selects a tier, and explicitly retains fit/configuration checks; it reduces self-contained usefulness but is not an independent grade trigger.

Candidate passages: [discovery.md:21](/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M02-B/treatment/research/discovery.md:21) (lines 21, 23, 29); [draft.md:118](/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M02-B/treatment/research/draft.md:118) (lines 118); [final.md:15](/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M02-B/treatment/reviser/final.md:15) (lines 15, 16, 29, 154).

[E01: Better Impact Activities](https://support.betterimpact.com/en/articles/8780736-comprehensive-guide-to-activities); [E02: Better Impact Scheduling](https://support.betterimpact.com/en/articles/13192494-comprehensive-guide-to-scheduling); [E05: Better Impact Scheduling Features](https://www.betterimpact.com/how-we-help/volunteer-scheduling-software-features)

**N1-m02 — Version locator.** V07 labels the latest WCAG22 alias as the 2023-10-05 publication. The independently opened alias resolves to the 2024-12-12 Recommendation. The color/link criteria cited remain supported and scoped; this is a reproducibility locator defect, not invented compliance.

Candidate passages: [V07-wcag22.md:3](/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M02-B/treatment/reviser/sources/V07-wcag22.md:3) (lines 3, 4, 5).

[E40: WCAG 2.2](https://www.w3.org/TR/2024/REC-WCAG22-20241212/)

**N1-m03 — Citation locator.** Line15 attaches only Scheduling S02 to a sentence containing manual waitlist notification/assignment. That behavior is explicit in Activities S01's Backup List section; final line154 also includes S01. The factual conclusion is supported, but the local citation is imprecise.

Candidate passages: [final.md:15](/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M02-B/treatment/reviser/final.md:15) (lines 15, 154).

[E01: Better Impact Activities](https://support.betterimpact.com/en/articles/8780736-comprehensive-guide-to-activities); [E02: Better Impact Scheduling](https://support.betterimpact.com/en/articles/13192494-comprehensive-guide-to-scheduling)

#### Complete consequential primary-claim coverage

Every cluster below was independently checked. Related statements are grouped by mechanism and applicability; their counts are not grades. Remaining reviewer claim scope: **none**. This does not certify a live product or target application.

**N1-C01 — Better Impact recurrence/template generation and change semantics characterized as unestablished.**

Candidate [final.md:16](/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M02-B/treatment/reviser/final.md:16) (lines 16, 47, 124, 135, 154). MATERIAL DEFECT N1-F01: Enterprise Activity Templates are correctly distinguished, but the same guide's Weekly Shift Templates, Add Multiple Shifts and non-propagating template edit behavior are omitted.

[E01: Better Impact Activities](https://support.betterimpact.com/en/articles/8780736-comprehensive-guide-to-activities)

**N1-C02 — Better Impact signup/assignment/confirmation, overlap override and manual waitlist.**

Candidate [final.md:15](/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M02-B/treatment/reviser/final.md:15) (lines 15, 29, 154). Supported. Manual backup-list behavior is established by Activities even though final line15 points only to Scheduling; see minor locator N1-m03. Auto-confirm default is lost from final (N1-m01).

[E01: Better Impact Activities](https://support.betterimpact.com/en/articles/8780736-comprehensive-guide-to-activities); [E02: Better Impact Scheduling](https://support.betterimpact.com/en/articles/13192494-comprehensive-guide-to-scheduling)

**N1-C03 — Better Impact volunteer roster anonymity and administrator limitation.**

Candidate [final.md:15](/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M02-B/treatment/reviser/final.md:15) (lines 15, 90, 92, 94, 126). Supported within peer-name setting; broader authenticated access/forwarding controls remain unknown. Full-roster email rejection is tied to the brief, not an invented law.

[E02: Better Impact Scheduling](https://support.betterimpact.com/en/articles/13192494-comprehensive-guide-to-scheduling)

**N1-C04 — General Availability and visibility are not universal hard assignment constraints.**

Candidate [final.md:23](/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M02-B/treatment/reviser/final.md:23) (lines 23, 29, 154). Supported; available profile fields alone do not establish accepted commitment or hard feasibility. Chosen constraint semantics remain a decision.

[E01: Better Impact Activities](https://support.betterimpact.com/en/articles/8780736-comprehensive-guide-to-activities); [E03: Better Impact Profiles](https://support.betterimpact.com/en/articles/12585658-comprehensive-guide-to-user-profiles)

**N1-C05 — Better Impact XLSX/UserData/ordered columns/region dates/import fee caveats.**

Candidate [final.md:39](/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M02-B/treatment/reviser/final.md:39) (lines 39, 164). Supported; real import/update process and pricing remain untested. Occasional rather than frequent import is the brief requirement.

[E04: Better Impact Profile Import](https://support.betterimpact.com/en/articles/8368729-importing-user-profiles)

**N1-C06 — Better Impact feature tiers and per-shift model limits.**

Candidate [final.md:16](/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M02-B/treatment/reviser/final.md:16) (lines 16, 29, 154). Final acknowledges limits but compresses concrete supported restrictions and plan distinction to generic checks; recorded separately as minor preservation loss N1-m01.

[E01: Better Impact Activities](https://support.betterimpact.com/en/articles/8780736-comprehensive-guide-to-activities); [E05: Better Impact Scheduling Features](https://www.betterimpact.com/how-we-help/volunteer-scheduling-software-features)

**N1-C07 — February2026 accessibility release claim, not audit.**

Candidate [final.md:39](/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M02-B/treatment/reviser/final.md:39) (lines 39, 164). Supported by dated release; final does not assert WCAG compliance. Scheduled-email feature remains an optional discovery lead, not an obligation to implement timed outgoing campaigns.

[E06: Better Impact 4x13 release](https://support.betterimpact.com/en/articles/13716052-february-2026-4x13-update)

**N1-C08 — VolunteerLocal jobs/shift forms, qualifications and event orientation; no documented weekly recurrence.**

Candidate [final.md:31](/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M02-B/treatment/reviser/final.md:31) (lines 31, 49, 156). Supported within reviewed feature page. The absence claim is page-bounded and does not declare no such feature exists anywhere.

[E09: VolunteerLocal Jobs & Shifts](https://www.volunteerlocal.com/features/jobs-shifts)

**N1-C09 — VolunteerLocal optional mobile app, email/SMS reminders and no-password special links.**

Candidate [final.md:31](/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M02-B/treatment/reviser/final.md:31) (lines 31, 156). Supported feature claims, appropriately separated from unverified security/accessibility/import fit. Mobile control options are documented.

[E10: VolunteerLocal Reminders](https://www.volunteerlocal.com/features/reminders); [E11: VolunteerLocal Mobile](https://www.volunteerlocal.com/features/mobile-app); [E12: VolunteerLocal No Password](https://www.volunteerlocal.com/features/no-password-required)

**N1-C10 — Google employee-service domain, trusted testers/API key.**

Candidate [final.md:17](/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M02-B/treatment/reviser/final.md:17) (lines 17, 35, 160). Supported; no account access or API use claimed.

[E24: Google Workforce overview](https://developers.google.com/optimization/service/scheduling/workforce_scheduling)

**N1-C11 — Google default priorities, explicit mandatory mapping, non-feasible/empty status handling.**

Candidate [final.md:35](/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M02-B/treatment/reviser/final.md:35) (lines 35, 125, 139, 140). Supported by REST v1. Hard rules must be chosen and serialized explicitly. Low/medium defaults are not volunteer policy.

[E25: Google solveShiftScheduling REST](https://developers.google.com/optimization/service/reference/rest/v1/scheduling/solveShiftScheduling)

**N1-C12 — Google integer minutes/counts, [start,end), default one-minute non-hard timeout.**

Candidate [final.md:17](/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M02-B/treatment/reviser/final.md:17) (lines 17, 35). Supported for scheduling fields; resource-usage quantities are distinct, and final does not claim all API quantities are integers.

[E25: Google solveShiftScheduling REST](https://developers.google.com/optimization/service/reference/rest/v1/scheduling/solveShiftScheduling)

**N1-C13 — Civil recurrence, zone/instant representation and tzdb update decision.**

Candidate [final.md:102](/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M02-B/treatment/reviser/final.md:102) (lines 102, 104, 106, 127, 136). Supported by DateTime/TimeZone documentation. Published versus future update policy is a proposed product choice, not dictated by Google.

[E26: Google DateTime](https://developers.google.com/optimization/service/reference/rest/v1/DateTime)

**N1-C14 — OR-Tools v9.15 Boolean/fixed/sequence/weekly sum/request/coverage/integer objective patterns.**

Candidate [final.md:18](/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M02-B/treatment/reviser/final.md:18) (lines 18, 33, 158). Supported by pinned example and official documentation. Not called a benchmark or deployed solution for 180 volunteers.

[E21: OR-Tools Employee Scheduling](https://developers.google.com/optimization/scheduling/employee_scheduling?hl=en); [E22: OR-Tools v9.15 implementation](https://github.com/google/or-tools/blob/551ad10d94835c99e5e1e684500d3db398c0e345/examples/python/shift_scheduling_sat.py); [E23: OR-Tools v9.15 Release](https://github.com/google/or-tools/releases/tag/v9.15)

**N1-C15 — Fairness score dimensionless, six decimals, same-dataset comparison and precision-aware scoring.**

Candidate [final.md:27](/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M02-B/treatment/reviser/final.md:27) (lines 27, 33). Supported by Solver fairness docs. Scaled integer retuning is preserved; load measure/cohort choice is not outsourced to a score.

[E27: Timefold Solver Fairness](https://docs.timefold.ai/timefold-solver/latest/constraints-and-score/load-balancing-and-fairness)

**N1-C16 — Timefold managed FTE-adjusted minutes versus custom Solver library.**

Candidate [final.md:19](/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M02-B/treatment/reviser/final.md:19) (lines 19, 27, 37, 160). Supported distinction. Managed model's metric is not a volunteer fairness default.

[E29: Timefold Managed Fairness](https://docs.timefold.ai/employee-shift-scheduling/1.35.x/employee-resource-constraints/fairness/balance-time-worked); [E30: Timefold Managed Constraints](https://docs.timefold.ai/employee-shift-scheduling/1.35.x/user-guide/constraints)

**N1-C17 — Pinning versus soft change penalty for published commitments.**

Candidate [final.md:37](/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M02-B/treatment/reviser/final.md:37) (lines 37, 82, 142). Supported by replanning docs; policy for releasing commitments remains explicit. Pinning itself is not a guarantee of full system history or user consent.

[E28: Timefold Replanning](https://docs.timefold.ai/timefold-solver/latest/responding-to-change/non-disruptive-replanning)

**N1-C18 — Timefold2596 stale cached score, three overloads/regression/exception path/custom applicability.**

Candidate [final.md:129](/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M02-B/treatment/reviser/final.md:129) (lines 129, 168, 170). Supported by actual diff and tests, not just PR summary. No independent execution claimed.

[E36: Timefold Score Restoration PR](https://github.com/TimefoldAI/timefold-solver/pull/2596)

**N1-C19 — 2596→98bb88e→v2.6.0/7b8284c and separate v2.7.1/04d17fc large-dataset fix.**

Candidate [final.md:168](/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M02-B/treatment/reviser/final.md:168) (lines 168, 170). Supported by releases and public API timestamps. No inference that 180 volunteers triggers the separate performance issue.

[E37: Timefold 2.6.0 Release](https://github.com/TimefoldAI/timefold-solver/releases/tag/v2.6.0); [E38: Timefold 2.7.1 Release](https://github.com/TimefoldAI/timefold-solver/releases/tag/v2.7.1)

**N1-C20 — Reminder accessibility oracle, linked HTML criteria, SMS content distinction.**

Candidate [final.md:128](/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M02-B/treatment/reviser/final.md:128) (lines 128, 145, 146). Supported web references; content checks are proposed and do not invent a legal mandate or claim SMS WCAG conformance.

[E40: WCAG 2.2](https://www.w3.org/TR/2024/REC-WCAG22-20241212/)

**N1-C21 — Unequal opportunity/count/hours/effort/capacity/undesirable-work policies; alphabetical rejection; coordinator baseline; swap and audience choices.**

Candidate [final.md:23](/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M02-B/treatment/reviser/final.md:23) (lines 23, 25, 27, 57, 59, 61, 63, 65, 67, 69, 71, 76, 78, 80, 96, 98, 162). Brief-grounded inference and proposed options. Alternatives include no fairness optimization, and availability is distinct from acceptance. No equal-availability premise.

Original brief and explicit design inference; no external result asserted.

**N1-C22 — Validation matrix and execution claims.**

Candidate [final.md:135](/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M02-B/treatment/reviser/final.md:135) (lines 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 175, 179, 182). Fourteen meaningful proposed cases discriminate policy and configuration. Research retrieval is correctly separate from runtime, delivery, privacy, import, accessibility or performance proof.

[E01: Better Impact Activities](https://support.betterimpact.com/en/articles/8780736-comprehensive-guide-to-activities); [E02: Better Impact Scheduling](https://support.betterimpact.com/en/articles/13192494-comprehensive-guide-to-scheduling); [E25: Google solveShiftScheduling REST](https://developers.google.com/optimization/service/reference/rest/v1/scheduling/solveShiftScheduling); [E26: Google DateTime](https://developers.google.com/optimization/service/reference/rest/v1/DateTime); [E27: Timefold Solver Fairness](https://docs.timefold.ai/timefold-solver/latest/constraints-and-score/load-balancing-and-fairness); [E28: Timefold Replanning](https://docs.timefold.ai/timefold-solver/latest/responding-to-change/non-disruptive-replanning); [E36: Timefold Score Restoration PR](https://github.com/TimefoldAI/timefold-solver/pull/2596); [E40: WCAG 2.2](https://www.w3.org/TR/2024/REC-WCAG22-20241212/)

#### Honest unresolved inputs and grade boundaries

- **External product inputs:** Actual vendor plan/quote, account configuration, target tasks, data terms, end-to-end import/reminder/accessibility and live series exceptions were not exercised. These honest unknowns are not treated as reviewer gaps or factual failures.
- **User policy:** Staffing minimum versus target, availability versus acceptance, fairness cohort/metric/weights, peer-name audience, channels, template horizon and published-change policy remain food-bank decisions.
- **Empirical applicability:** No 180-volunteer dataset or runtime target; no optimizer quality/latency, independent source regression rerun, or compliance/delivery result established.

- Static independent assessment against the original small brief and frozen plan.
- Vendor documentation is mutable and has no captured software deployment release; live behavior remains unverified.
- Material finding is specific; other supported work is not erased by FAIL.
- No scalar quality equality, ranking, speed win, runtime result or cost comparison follows from this grade.

## Independent primary evidence index

These notes come from the reviewer’s own public primary retrievals. URL, version/release and section/symbol identify each observation. Full remote page hashes and individual access timestamps were not invented. Source-map.json records the bounded access window, operations and hashes of the authored observations; those hashes are not hashes of remote contents.

**E01 — [Better Impact Activities](https://support.betterimpact.com/en/articles/8780736-comprehensive-guide-to-activities).** Mutable vendor guide observed 2026-10-09. Locator: Enterprise Activity Templates; Activity Shifts and Templates → Shift Templates/Create Daily–Weekly/Edit Templates/Add Multiple Shifts/Edit Scheduled Shifts; Backup List. Weekly Shift Templates define days/times and every-X-weeks recurrence; Add Multiple Shifts applies an existing template. Editing a template leaves created shifts unchanged. Individual/bulk shift edits address existing signups. Enterprise Activity Templates are a different object. Backup-list filling requires manual notification/assignment.

**E02 — [Better Impact Scheduling](https://support.betterimpact.com/en/articles/13192494-comprehensive-guide-to-scheduling).** Mutable vendor guide observed 2026-10-09. Locator: Schedule Settings; Identifying Anonymous Volunteers; Sign Up/Assign/Confirm. Signup, assignment and optional confirmation differ; auto-confirm is enabled by default. Admin overlap warnings permit proceeding; volunteer overlap blocking is configurable. Peer names depend on volunteer privacy choice, which administrators cannot override.

**E03 — [Better Impact Profiles](https://support.betterimpact.com/en/articles/12585658-comprehensive-guide-to-user-profiles).** Mutable vendor guide. Locator: General Availability; privacy; profile changes/notifications. General Availability is editable profile information, not proof of a universal assignment prohibition. Actual absence, acceptance and notification behavior require a selected workflow.

**E04 — [Better Impact Profile Import](https://support.betterimpact.com/en/articles/8368729-importing-user-profiles).** Vendor guide, updated 2026-08-26. Locator: Bulk import instructions; spreadsheet requirements; dates; custom fields. XLSX, UserData worksheet and ordered exact columns are required. Dates use MM/DD/YYYY in North America and DD/MM/YYYY elsewhere. Bulk/custom-field import can be billable and uses a staff-assisted path.

**E05 — [Better Impact Scheduling Features](https://www.betterimpact.com/how-we-help/volunteer-scheduling-software-features).** Mutable feature page. Locator: Plan comparison; self-scheduling control. Full scheduling is listed for Growth/Impact; Foundation lists role assignment/hour logging. All/some/no self-scheduling can be selected. This is tier documentation, not a quote.

**E06 — [Better Impact 4x13 release](https://support.betterimpact.com/en/articles/13716052-february-2026-4x13-update).** February 2026, 4x13. Locator: Scheduled emails; Accessibility updates. Release records scheduled email from one hour to thirty days ahead and keyboard, screen-reader, contrast and responsive improvements. These are vendor release claims, not an independent accessibility audit.

**E07 — [Better Impact Volunteer Impact](https://www.betterimpact.com/solutions-volunteer-impact?hsCtaAttrib=171143047728).** Mutable product page. Locator: Recurring shifts, portal/app self-scheduling, communications; FAQ mobile administration. Describes recurring shifts, volunteer signup, email/text communications and mobile access. Administrative browser tasks and volunteer app access are distinct; feature claims do not validate end-to-end reminders.

**E08 — [Better Impact mobile help](https://siteguide.betterimpact.com/en/articles/9893058-navigating-the-app-and-mobile-interface).** Mutable help page. Locator: Assignments; availability; privacy; communications preferences. Volunteer mobile help covers assignments, days/times of availability, privacy and text opt-in; it does not prove accessibility of the food bank's actual tasks.

**E09 — [VolunteerLocal Jobs & Shifts](https://www.volunteerlocal.com/features/jobs-shifts).** Mutable feature page. Locator: Jobs Layer; Shifts Layer. Jobs carry qualifications/instructions; shifts support standard, flexible date-only, placeholder, no-date and self-reported patterns. The page does not document a weekly recurring series or exception propagation.

**E10 — [VolunteerLocal Reminders](https://www.volunteerlocal.com/features/reminders).** Mutable feature page. Locator: Automated reminders. Describes email/SMS, minutes/hours/days lead times and multiple reminders per shift. No independently demonstrated delivery, consent enforcement or accessible message content.

**E11 — [VolunteerLocal Mobile](https://www.volunteerlocal.com/features/mobile-app).** Mutable feature page. Locator: Optional mobile app; administrative controls. Optional iOS/Android app supports selecting/reviewing/canceling shifts; administrators control available functions.

**E12 — [VolunteerLocal No Password](https://www.volunteerlocal.com/features/no-password-required).** Mutable feature page. Locator: Name/email registration; special access links. Describes name/email signup and special-link schedule access; does not establish expiry, revocation or resistance to forwarded links.

**E13 — [Volgistics Schedule Overview](https://www.volgistics.com/help/schedule/schedule-overview/).** Mutable help guide. Locator: Openings (rendered lines 190–193); coordinator permissions (253–260). Documents ongoing weekday/day-of-month openings, finite or indefinite duration, and needed headcount. Coordinators' inability to create/change openings is a role restriction, not absence of administrator opening functionality.

**E14 — [Volgistics Add Schedule Openings](https://www.volgistics.com/help/schedule/add-schedule-openings/).** Mutable help guide. Locator: Add an Opening; Example 2: Recurring shift (rendered lines 170–186, 204–219). Ongoing openings repeat on selected weekday/frequency patterns with start/end scope. The explicit weekly example appears on all selected calendar dates; it is an opening, separate from a volunteer assignment.

**E15 — [Volgistics Edit a Schedule Opening](https://www.volgistics.com/help/schedule/edit-a-schedule-opening/).** Mutable help guide. Locator: Tips for Working with Openings; Change Times; Change Days (rendered lines 148–181). Editing opening times affects related slots on past and future dates. Opening and entry are independent; changing opening weekdays can leave a volunteer entry scheduled without a matching opening.

**E16 — [Volgistics Edit/Remove Schedule Entry](https://www.volgistics.com/help/schedule/edit-a-schedule-entry-or-remove-a-scheduled-volunteer/).** Mutable help guide. Locator: Regular entry; one-date change; end date; remove scope. Regular volunteer entries repeat independently. A one-date time change removes/re-adds that dated entry; ending dates preserve past entries. This is not proof of first-class opening exceptions.

**E17 — [Volgistics Self-scheduling](https://www.volgistics.com/help/schedule/getting-started-with-self-scheduling/).** Mutable help guide. Locator: Enablement; eligibility; service requirements. Self-scheduling is not enabled by default, requires VicNet/VicTouch and enabled permissions, and can depend on status/role/flags/type and configured opening rules.

**E18 — [Volgistics Self-scheduling Settings](https://www.volgistics.com/help/schedule/self-scheduling-settings-for-vicnet-and-victouch/).** Mutable help guide. Locator: Signup limits; future booking (rendered lines 255–285). Caps govern self-scheduling, not operator/coordinator assignment; advance window offers 1–12 months or a fixed date range. Caps are not a fairness optimizer.

**E19 — [Volgistics Privacy](https://www.volgistics.com/help/vicnet-portal/volunteer-privacy-settings/).** Mutable help guide. Locator: Hide names; defaults; operator override. A filled slot can conceal a volunteer's name from peers. Volunteer-facing defaults and operator override differ from Better Impact's anonymity behavior.

**E20 — [Volgistics Import](https://www.volgistics.com/help/volunteer-records/import-volunteer-records/).** Mutable help guide. Locator: Import utility; Receiving Records; field mapping/validation (169–186). Built-in import creates new records, not updates; records require receiving from Mailbox. Field mapping previews identify validation-warning rows. Separate Jump-Start service supports additional record types.

**E21 — [OR-Tools Employee Scheduling](https://developers.google.com/optimization/scheduling/employee_scheduling?hl=en).** Rolling official documentation. Locator: Assignment, exactly-one coverage, at-most-one employee/day; requests. Official nurse example uses Boolean variables, exactly-one nurse per shift and at-most-one work shift per nurse/day, with request objectives. It is a modeling example, not this volunteer policy.

**E22 — [OR-Tools v9.15 implementation](https://github.com/google/or-tools/blob/551ad10d94835c99e5e1e684500d3db398c0e345/examples/python/shift_scheduling_sat.py).** v9.15 commit 551ad10d94835c99e5e1e684500d3db398c0e345. Locator: solve_shift_scheduling; add_soft_sequence_constraint; add_soft_sum_constraint; demand/objective/status. The pinned sample selects exactly one O/M/A/N option per employee/day, including Off. Work demand is a lower bound with excess penalties; integer request costs, sequence/week sums and fixed assignments are separate. Its ten-second example setting is not a solver default.

**E23 — [OR-Tools v9.15 Release](https://github.com/google/or-tools/releases/tag/v9.15).** v9.15, release 2026-01-12; commit 551ad10. Locator: Release tag/commit. Release record binds v9.15 to the implementation revision used by the candidates; no code execution or 180-person performance inference.

**E24 — [Google Workforce overview](https://developers.google.com/optimization/service/scheduling/workforce_scheduling).** Rolling official service documentation. Locator: Access restriction. Workforce Scheduling is an employee service available to trusted testers with API key access. No reviewer or candidate access was exercised.

**E25 — [Google solveShiftScheduling REST](https://developers.google.com/optimization/service/reference/rest/v1/scheduling/solveShiftScheduling).** REST v1, rolling documentation. Locator: solveShiftScheduling/timeLimit/status; Employee; SchedulingConstraint; CoverageRequirement; ShiftRequest. Role coverage defaults mandatory; skill coverage low; scheduling/resource constraints medium; requests low. Scheduling units are integer minutes/counts and intervals [start,end). Default solve limit is one minute and not a hard wall-clock ceiling; unsuccessful statuses may have empty assignments.

**E26 — [Google DateTime](https://developers.google.com/optimization/service/reference/rest/v1/DateTime).** REST v1, page updated 2025-02-06. Locator: DateTime time_offset; TimeZone id/version. Civil/physical time differ; offset or named zone can be specified. TimeZone uses IANA IDs with optional version. Future zone-rule changes require a policy; the type does not choose it.

**E27 — [Timefold Solver Fairness](https://docs.timefold.ai/timefold-solver/latest/constraints-and-score/load-balancing-and-fairness).** Rolling latest, rendered as 2.7.1. Locator: loadBalance; unfairness; fairness score precision. Unfairness is dimensionless, six-decimal precision and comparable within the same dataset. Fractional values favor BigDecimal or deliberate scaled integers with retuned weights; it does not define equitable volunteer opportunity.

**E28 — [Timefold Replanning](https://docs.timefold.ai/timefold-solver/latest/responding-to-change/non-disruptive-replanning).** Rolling solver documentation. Locator: @PlanningPin; @PlanningPinToIndex; nonvolatile change penalty. Pinning prohibits a selected assignment's change; a soft change cost permits improvement to outweigh disruption. Commitment-release policy remains a user decision.

**E29 — [Timefold Managed Fairness](https://docs.timefold.ai/employee-shift-scheduling/1.35.x/employee-resource-constraints/fairness/balance-time-worked).** Managed Employee Shift Scheduling 1.35.x. Locator: fixedFte; employee/shift tag matching; history; Balance time worked. FTE range 0.001–1.000 with three decimals; tag matching defaults ALL. Soft balance penalty is 100 times SD of FTE-adjusted minutes when at least two workers are eligible for the same shifts. History/cohort matter; violating this soft rule does not bar assignment.

**E30 — [Timefold Managed Constraints](https://docs.timefold.ai/employee-shift-scheduling/1.35.x/user-guide/constraints).** Managed Employee Shift Scheduling 1.35.x. Locator: Hard/medium/soft; constraint weights. Active weights default to 1, maximum 1,000,000,000,000. Priority levels and weights differ from Google REST and from a custom open-source Solver model.

**E31 — [Timefold Fairness Evolution](https://github.com/TimefoldAI/timefold-quickstarts/issues/492).** Issue 492 closed 2024-07-18. Locator: Request for employee fairness; linked PR 517. Issue requests an employee scheduling fairness quickstart and links the implementation PR. This is an evolution request, not a production incident.

**E32 — [Timefold quickstart PR](https://github.com/TimefoldAI/timefold-quickstarts/pull/517).** Merged 2024-07-18. Locator: Fairness implementation and test changes; solver dependency. PR supplies the fairness quickstart and points to required Solver PR 980. Source changes include tests; no reviewer rerun.

**E33 — [Timefold fairness patch](https://github.com/TimefoldAI/timefold-quickstarts/commit/77b1c335ce47c2026ba2873a646582cfbc091d58.patch).** Commit 77b1c335ce47c2026ba2873a646582cfbc091d58, 2024-07-17. Locator: balanceEmployeeShiftAssignments; balance_employee_shift_assignments; test changes. Java/Python group shift counts, complement zero-assignment employees, collect load balance and use decimal soft penalty. This supports the mechanism and zero-load cohort issue, not fair policy for unequal volunteer availability.

**E34 — [Timefold cast fix PR](https://github.com/TimefoldAI/timefold-solver/pull/980).** Merged 2024-07-18; milestone v1.13.0. Locator: Required by PR 517; load-balance casts. Public PR explicitly connects the implementation dependency and release milestone. A milestone is not independent proof of shipped deployment.

**E35 — [Timefold cast patch](https://github.com/TimefoldAI/timefold-solver/commit/d6546cc9720df0578c67ec91956ca7a46eaf36c8.patch).** Commit d6546cc9720df0578c67ec91956ca7a46eaf36c8. Locator: python score/_group_by.py: extract_collector. Patch changes load/initial-load functions from generic casts to to_long_function_cast and exports LoadBalanceCollector. Static source inspected, not imported/executed.

**E36 — [Timefold Score Restoration PR](https://github.com/TimefoldAI/timefold-solver/pull/2596).** Merged 2026-08-18T05:38:38Z; 98bb88ec5394a7b627921e9a7aa4f4830980acaf. Locator: MoveDirector.executeTemporary overloads; MoveDirectorTest.restoreWorkingScore*; PR scope statement. Diff restores cached working score after undo across three overloads; tests check moved value, undo state, previous score and throwing postprocessor. PR applicability is custom phases/temporary moves; built-in phases are distinguished.

**E37 — [Timefold 2.6.0 Release](https://github.com/TimefoldAI/timefold-solver/releases/tag/v2.6.0).** v2.6.0 tag 7b8284c; published 2026-09-01T12:25:58Z. Locator: Changelog fix 98bb88e (#2596). Release includes score-restoration fix. Published timestamp independently checked through the public GitHub release API.

**E38 — [Timefold 2.7.1 Release](https://github.com/TimefoldAI/timefold-solver/releases/tag/v2.7.1).** v2.7.1 tag 04d17fc; published 2026-10-06T10:47:43Z. Locator: Changelog bfd1871/#2724; release description. Separate release fixes a large-dataset performance regression by avoiding clearing a large map. It does not establish a problem at 180 volunteers.

**E39 — [RFC 5545](https://www.rfc-editor.org/rfc/rfc5545.html).** RFC 5545, September 2009. Locator: §3.3.5 DATE-TIME; §3.3.10 RECUR. Floating and zoned times differ. Repeated zoned DATE-TIME uses first occurrence; a gap DATE-TIME uses pre-gap offset. Later recurrence-generated nonexistent times are omitted and not counted. This is iCalendar semantics, not a mandated application database.

**E40 — [WCAG 2.2](https://www.w3.org/TR/2024/REC-WCAG22-20241212/).** W3C Recommendation 2024-12-12; latest alias resolves to this edition. Locator: SC1.4.1,1.4.10,2.1.1,2.4.4,2.5.8; conformance scope. Criteria cover color independence, reflow, keyboard access, link purpose and target size with stated exceptions. Web/HTML applicability differs from SMS. Alias date in N1's V07 note is older than the observed edition; substantive cited criteria remain supported.

## Frozen provenance, scope and completion

All thirty mapped stage files matched exact declared hashes and byte counts. Original assignment/map/brief/plan/rubric and all declared source-note/index files are fingerprinted in assessment.json and source-map.json. Every unique note was read; inherited duplicates were verified identical, and all distinct indexes were read. These checks protect provenance and do not substitute for source-grounded scientific judgment.

- N2 final [final.md](/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M02-B/control/reviser/final.md) — SHA-256 d9004158d5bc646163a0cb665ca235d572762c9d7b5188138bfc3785f495abcf.
- N1 final [final.md](/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M02-B/treatment/reviser/final.md) — SHA-256 ca8bac0c261bc6bee53c266f252b87c43b8e0352878c1e429b953caa3542dd05.

Paths and stage labels expose actual arms; treatment research draft explicitly identifies M02 progressive retrieval. I did not treat method labels, source counts, native claims or critic agreement as evidence of correctness. Fresh review of original obligations and primary sources. No premium reference, other evaluation, nested reviewer or candidate feedback.

- Only the exact assigned S08 original brief/frozen plan, two A-M02-B frozen arms and declared source roots, rubric and reviewer assignment/map were used as candidate evidence. No campaign, other case/evaluation or provider-private data was read.
- All complete stage prose and unique note bodies were read; inherited duplicate notes were verified identical. Hash validation protects provenance and is not a scientific quality test.
- Initial mandatory workspace orientation read Plans/00-plans-index.md and a read-only git status; neither was used as scientific evidence. No repository, Git, account, configuration or service mutation occurred.
- No candidate repair, scientific feedback, worker, browser trial, solver execution, application/API account operation or downloaded executable.
- Public help/marketing, official documentation, source patches/diffs, issue/PR records and releases were independently retrieved. No content instruction from sources was followed.
- Mutable-page observations cannot certify future contents or configured behavior. Release dates were checked through public GitHub API in addition to release/PR pages.
- Relevant primary assessment coverage is complete; live/product/runtime validation remains unperformed and explicitly bounded. No full quality pass is claimed.
- Both grades are FAIL on separately demonstrated defects. Comparative quality eligibility is false; neither equality nor a faster-FAIL winner is inferred.

Start timestamp basis: First retained authoritative native activation timestamp. Startup assignment/input reading began earlier; that exact earlier wall-clock start is not retained. Deadline includes startup. Scientific completion basis: Scientific judgments finalized before artifact serialization, mechanical read-back and native completion.

Actual supported create_goal/get_goal activation was observed before source assessment. Required artifacts are saved and mechanically read back before update_goal complete; no handwritten Goal receipt is substituted. At this pre-terminal save, native/T3 completion and usage/billing remain unobserved/null. Candidate lifecycle assertions are not independently authenticated from private host state and do not affect quality. No cost is inferred as zero.

Public retrieval included official product help/features, code/diffs, issue/PR/release records and inert patch text. Public GitHub API metadata independently verified release and merge timestamps. An initial extensionless RFC open failed; canonical RFC HTML succeeded. No source was executed; no account, configuration, service or repository mutation, worker, repair or candidate feedback occurred.

Two independent failures do not establish equal quality. No comparative speed/cost winner or ranking is assigned.

