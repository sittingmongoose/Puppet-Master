# Critique — volunteer-shifts scheduling plan

**Case:** S08, volunteer-shifts  
**Assignment:** A-M02-B / treatment / critic  
**Method:** M02 progressive retrieval  
**Inputs:** the exact brief, frozen six-clause plan, and complete declared research predecessor set in the input map.  
**Independent evidence:** bounded notes C01–C11 and source-map.json.  
**Execution status:** no product account, API, solver, import, accessibility flow, or application witness was run. All proposed validations remain proposed.

## Overall assessment

The research draft is careful, self-contained, and appropriately distinguishes product claims from policy and implementation recommendations. Its key directions are sound: do not assign alphabetically without a policy, separate signup from confirmed assignment, restrict roster visibility, preserve local-time intent with a zone, and expand an ordinary-week smoke test. The inspected primary sources support its core claims about Google API priorities and time limits, Google DateTime semantics, Better Impact signup/privacy/overlap behavior, Timefold load balancing and replanning, the OR-Tools example, and the Timefold #2596 release chain. I found no material factual error that reverses the draft's recommendation.

Three material clarifications should be carried into any accepted final: distinguish a reusable activity template from automatic recurring occurrence generation; define the policy for published and future occurrences when local time-zone rules change; and test the accessibility of the reminder itself. Also make explicit that a solver's default priorities do not implement the draft's proposed hard rules automatically. These are corrections to scope and validation, not grounds to discard the draft.

## Material findings

### M1 — P1: recurrence evidence does not establish automatic weekly expansion

**Finding:** Keep P1 as a candidate capability, but do not treat the cited Better Impact template evidence as proof that a weekly template automatically creates dated occurrences. The vendor guide calls Recurring Pattern an activity schedule type, and separately documents reusable Enterprise Activity Templates; it says administrators create individual shifts when using an Enterprise Activity Template. VolunteerLocal's reviewed Jobs & Shifts page lists shift forms but makes no recurrence claim. The draft already acknowledges that exceptions and per-occurrence behavior are unverified, but it should also distinguish schedule recurrence from template reuse. [C05](sources/C05-better-impact-activities.md) [C06](sources/C06-volunteerlocal-jobs-shifts.md)

**Disposition:** Already substantially covered, with a needed factual clarification to the evidence characterization. State that recurrence is a documented product concept while automated expansion, exception edits, and published-occurrence identity are unverified. Treat stable occurrence IDs and update behavior as proposed requirements, not observed product behavior.

**Discriminating check:** In an actual configured trial, create a weekly recurring pattern and separately create an activity from a reusable template. Confirm which action materializes dated shifts, how exceptions work, and whether editing the pattern changes already published shifts or signups. This is proposed, not run.

### M2 — P2 and solver alternative: policy-hard constraints must be mapped to explicit solver priorities

**Finding:** The draft accurately identifies the Google API's priority and timeout defaults, but the final implementation guidance should connect those facts directly to the proposed hard/soft hierarchy. The REST schema assigns default medium priority to scheduling constraints and lower defaults to some skill coverage and shift requests; the default solve limit is one minute, is not a hard latency bound, and non-feasible/non-optimal responses may omit assignments. A model that relies on omitted priority fields could therefore soften a condition the food bank considers mandatory. [C02](sources/C02-google-workforce-rest.md)

**Disposition:** Core P2 rejection is supported. Keep eligibility, consent/commitment, overlap, coverage, and capacity distinctions as decisions to be made with coordinators; explicitly set every chosen mandatory constraint to mandatory in a Google API prototype, and test status handling, empty assignments, timeouts, and infeasibility. Do not imply an API default is a volunteer policy. OR-Tools examples likewise supply modeling patterns and objective weights, not a fair allocation rule. [C01](sources/C01-ortools-v9.15-source.md) [C11](sources/C11-google-workforce-overview.md)

**Validation applicability:** The draft's eligibility, overlap/capacity, and supply-shortage rows are useful. Add assertions for priority serialization and response-status handling before any proposal can be published. No such check was run.

### M3 — P4: privacy-safe default is justified; exact peer roster remains a user decision

**Finding:** Rejecting an unconditional full-roster email is a defensible default under the brief's privacy-limited-sharing requirement. Better Impact provides product-specific evidence that peer name visibility can be volunteer-controlled and that administrators may still see names, but this does not establish the food bank's chosen peer-visibility policy. A roster email to volunteers on one shift, a team-wide schedule view, and an operational coordinator roster expose different information to different audiences; the draft should retain this distinction in the final decision record. [C04](sources/C04-better-impact-scheduling.md)

**Disposition:** Keep “reject as the default” for P4 as written; classify whether any team-level names or whole-roster access are allowed as a user decision. The draft already names this decision, so this is not a false correction. Keep the limit on phone numbers, contact details, availability, and qualifications in notices unless the organization explicitly approves the field and audience.

**Validation applicability:** The privacy matrix should test each role and channel, including forwarded email and access from a shared device. The existing view test is proposed and useful, but it does not prove link security or mail forwarding can be controlled.

### M4 — P5: time model is sound, but future rule changes need an expected outcome

**Finding:** The draft correctly rejects a bare local date-time and preserves local recurrence intent plus an IANA zone and resolved occurrence instant. Google recommends Timestamp for physical time, with a separate zone field where needed, and warns that future time-zone rule changes can affect stored future values. The draft's DST gap/repeated-hour test is applicable, but its expected result does not say what happens after a site-zone change or a time-zone database update. [C03](sources/C03-google-datetime.md)

**Disposition:** Keep P5 as a correction. Before implementation, decide whether changed rules re-resolve only unpublished future occurrences, whether published shifts retain the prior instant, and how coordinators review or confirm affected assignments. Those choices belong to the product, not Google's API.

**Validation applicability:** Test a recurring shift in a spring-forward gap and repeated fall-back hour; a time-zone database rule change; and a site moving to a different zone. Include published and unpublished occurrences and assert both displayed local time and overlap/reminder instants. Proposed, not run.

### M5 — P6: accessibility validation must inspect reminder content, not only the link

**Finding:** The brief specifically requires accessible reminders. The draft correctly labels vendor accessibility statements as claims rather than audits and proposes screen-reader, keyboard, and mobile reviews. However, its reminder case mainly checks recipient-appropriate details and an accessible schedule link; it does not explicitly test the reminder message's structure, text alternative, announced date/time and time zone, or the usability of the action without color or a visual-only link. Better Impact's cited release note cannot establish that these specific messages pass. [C04](sources/C04-better-impact-scheduling.md)

**Disposition:** Keep P6 as a smoke-test-plus-broader-validation correction. Add a test of the actual email and SMS templates with assistive technology or a defined content review, including a clear local date, start/end time, zone where needed, location, cancellation/contact action, and non-color status cues. Choose the applicable accessibility acceptance criteria with the organization; do not invent a legal mandate.

### M6 — issue/release chain: supported and appropriately bounded

**Finding:** The described Timefold #2596 defect and fix are supported by the PR and release record: temporary-move undo could leave the cached working-solution score inconsistent; the fix restores the old score (or recalculates in the specified branch), includes a throwing-postprocessor path in tests, and appears in v2.6.0. The draft appropriately says this is an engine issue, not a volunteer incident, and ties it to this case only if custom temporary moves are used. The later v2.7.1 performance fix is separate and described at the right level. [C09](sources/C09-timefold-pr-2596.md) [C10](sources/C10-timefold-releases.md)

**Disposition:** Retain as relevant implementation evolution, with its conditional applicability. No correction required.

## Clause-by-clause adjudication

| Clause | Critic disposition | Assessment |
|---|---|---|
| P1 — recurring weekly template | Retain as a workflow candidate; clarify recurrence versus reusable template and verify generated occurrences | Partly covered; clarification required (M1) |
| P2 — first available alphabetically | Reject as an allocation policy; decide eligibility, consent, coverage, ties, fairness cohort and hard/soft rules | Supported; implementation must set explicit solver priorities (M2) |
| P3 — coordinator swaps | Retain with validation, consent/confirmation, review, atomicity and an override policy | Supported as a proposed design; none of those behaviors were tested |
| P4 — email everyone the full roster | Reject as an unconditional default; decide approved peer visibility and channels | Safe default is supported; roster scope remains a user decision (M3) |
| P5 — local wall-clock timestamps | Revise to preserve local recurrence rule and zone while resolving each occurrence to an instant | Supported; zone/tzdb change behavior needs a decision and test (M4) |
| P6 — one ordinary week | Keep as a smoke test and expand scenario, integration and accessibility review | Supported; actual reminder accessibility is missing from the explicit test oracle (M5) |

## Discovery, alternatives, and validation review

The draft distinguishes three materially different routes: coordinator-reviewed signup in a volunteer-management suite, an event/job-first signup product, and a custom or hosted solver-assisted workflow. Better Impact and VolunteerLocal are supported by vendor pages, but neither was trialed; their recurrence, privacy, accessibility, import, pricing, and configuration claims remain evaluation questions. OR-Tools is a self-hosted library/example, Google is a restricted employee-scheduling service, and Timefold is a custom solver library/model; none is shown to be a ready-to-use volunteer product. This is a sufficient comparison set for the scoped brief, not a procurement ranking. The lower-assumption coordinator-reviewed pilot remains appropriate while allocation policy is unresolved.

The validation matrix is meaningfully discriminating and consistently labels checks as proposed. It covers recurrence edits, DST, eligibility, overlaps, ties, shortages, swaps, publication stability, privacy, reminders, mobile/accessibility, imports, and fairness. The key additions are the M1 recurrence/template trial, explicit solver priority/status assertions (M2), zone-rule update cases (M4), and assistive-technology review of actual reminder messages (M5). Add no legal or equal-availability assumptions. No validation execution is claimed.

## Method and scope record

This was a fresh critic pass inside the active native Goal created for this assignment; Goal activation was observed through the supported create/get calls. The predecessor draft's disclosure that it did not run separate fresh critic and reviser agents is retained as a limitation. This assignment forbids nested agents, so this critic does not claim an independent reviser or claim to reproduce an unavailable separate-agent round. The present stage is Critic; it does not repair the predecessor draft.

Only the assignment, exact input map, declared brief/predecessors/source-root evidence, and public primary sources listed in the critic source map were used. No parent, counterpart, evaluator, or campaign/history material was read. No product, API, solver, account, import, notification, accessibility flow, or executable witness was run. Usage and billing were not observed and remain null. Candidate repair and repository/canon changes were out of scope.
