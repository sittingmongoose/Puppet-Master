# Research draft — volunteer-shifts scheduling plan

**Case:** S08, volunteer-shifts  
**Assignment:** A-M02-B / treatment / research  
**Method:** M02 progressive retrieval  
**Plan compared:** the frozen plan revealed for this case, reproduced clause by clause below  
**Evidence boundary:** public primary product, API, documentation, release, and source records listed in the source map. No account, tenant, API, solver, or application was exercised.

## Findings

The six-clause plan is too thin to implement safely as written. Retain a weekly recurrence concept, coordinator-assisted swaps, and an ordinary-week test as parts of a broader design. Revise the assignment rule, roster sharing, time representation, and validation scope before implementation.

The strongest product evidence is specific and bounded:

- Better Impact distinguishes volunteer signup from assignment; approval can be configured, overlap warnings may be overridden by an administrator, and its documented waitlist flow still needs manual notification and assignment. Its guide says roster-name anonymity is controlled by volunteers and administrators cannot override that setting. These are useful workflow and privacy observations about that product, not guarantees about other systems. [S02](sources/S02-better-impact-scheduling.md)
- Better Impact documents recurring activity types and templates, but its guide also describes limits on what can be attached to a particular shift. This supports investigating recurrence and templates; it does not establish that a weekly template with all needed exceptions and per-shift fields is available in every plan. [S01](sources/S01-better-impact-activities.md)
- Google’s Workforce Scheduling API has explicit coverage, skills, request, scheduling, time-zone, and duration concepts. Its documented priorities and one-minute default time limit are specific to that API. The documentation states the time limit is not a hard wall-clock limit; access is restricted to trusted testers and requires an API key. It is an employee-scheduling service, not evidence of a ready-to-use volunteer product. [S14](sources/S14-google-workforce-overview.md) [S15](sources/S15-google-workforce-rest.md)
- OR-Tools’ v9.15 example encodes Boolean assignments, coverage, fixed assignments, preferences, sequence constraints, and weekly sums over an example employee roster. The example demonstrates modeling options, not a validated volunteer policy or a running result for this case. [S12](sources/S12-ortools-v9.15-source.md) [S13](sources/S13-ortools-v9.15-release.md)
- Timefold documents configurable load balancing and non-disruptive replanning. Its fairness score depends on the selected cohort, measure, and data set; it does not decide what fairness means for these volunteers. Its managed employee-scheduling model uses an FTE-adjusted time-worked metric, which should not be silently imported as a volunteer fairness policy. [S17](sources/S17-timefold-fairness.md) [S18](sources/S18-timefold-replanning.md) [S19](sources/S19-timefold-managed-fairness.md)

### Clause-by-clause comparison

#### P1 — “Generate recurring shifts from a weekly template.”

**Disposition: retain as a candidate workflow, with explicit semantics and a capability check.**

Better Impact’s activity guide describes recurring activity types and templates, so recurring work is a real product pattern. Its documented categories include recurring, disjointed, one-time, seasonal, and unscheduled activities. That guide does not prove every weekly-template behavior implied by this sentence, such as exceptions, per-occurrence roles, or treatment of changed availability. [S01](sources/S01-better-impact-activities.md)

VolunteerLocal documents jobs and shifts, qualifications, locations, and several date-entry modes, but the reviewed source does not establish recurrence from weekly templates. Do not infer that feature from its shift model. [S07](sources/S07-volunteerlocal-jobs-shifts.md)

Specify a recurrence as a local civil-time rule attached to an IANA time zone, with dated occurrences materialized for signup and assignment. Define how cancellations, holidays, changed hours, and a change in the template affect already-published occurrences. Preserve stable occurrence IDs so a revised template does not silently erase signups. These are proposed product semantics, not features verified in the cited products.

**Decision still needed:** whether a changed template updates only future unpublished occurrences, or offers coordinators an explicit review of affected published shifts. Also decide whether recurring shifts can differ by role, skill, location, or capacity.

#### P2 — “Assign the first available volunteer alphabetically.”

**Disposition: reject this allocation rule. Replace it with eligibility, consent, capacity, and an explicit allocation policy.**

“Available” is not operationally defined by the plan. A profile’s general availability, a volunteer’s signup, an eligibility qualification, an explicit acceptance of a particular shift, a coordinator assignment, and a confirmed commitment are different facts. Better Impact’s documentation makes the signup-versus-assignment distinction visible; it also documents approval and configurable automatic confirmation. A waitlist does not necessarily resolve itself. [S02](sources/S02-better-impact-scheduling.md) General availability is maintained in a profile, but that alone does not establish consent or confirm a specific shift. [S03](sources/S03-better-impact-profiles.md)

Alphabetical order has no demonstrated relationship to eligibility, preferences, opportunity, reliability, or fairness. It can also give a persistent advantage to names early in the chosen collation order. Do not replace it with an unqualified “assign everyone equally”: volunteers can have different schedules, roles, qualifications, and chosen capacity. The case brief expressly does not authorize an equal-availability assumption.

A safer first release is coordinator-mediated self-signup or expressions of interest, with transparent eligibility checks and a reviewable allocation step. If demand exceeds capacity, define a policy before automating assignment. Possible alternatives include first-confirmed signup among eligible volunteers, a rotation among eligible volunteers, or solver-assisted selection using hard feasibility constraints and documented soft preferences. Each has tradeoffs: first-confirmed rewards access and response speed; rotation needs a clear reset and exception policy; optimization can hide value judgments inside weights. Present the selected rule to coordinators and test it against realistic scenarios.

For solver-assisted allocation, keep safety and qualification constraints hard (for example, role eligibility, one person cannot cover overlapping shifts, and published fixed assignments are preserved unless a coordinator changes them). Treat preferences as soft only when the volunteer has chosen to provide them. Define capacity and minimum-rest rules only if the organization requires them. OR-Tools demonstrates Boolean assignments, coverage, fixed assignments, request weights, sequence constraints, and weekly totals, but its sample is not a volunteer assignment policy. [S11](sources/S11-ortools-employee-scheduling-docs.md) [S12](sources/S12-ortools-v9.15-source.md)

A fairness measure requires a declared population and denominator. Potential policies include balancing assignments among people who opted into comparable opportunities, comparing assigned minutes against each person’s declared capacity, or monitoring distribution by role. None is universally correct. Timefold’s documented load-balancing score depends on the dataset and selected measure; its managed employee product uses an FTE-adjusted measure that does not automatically fit volunteers. [S17](sources/S17-timefold-fairness.md) [S19](sources/S19-timefold-managed-fairness.md) Record the candidate metrics and obtain a coordinator decision before using one to rank volunteers.

**Required definitions before implementation:** the authoritative availability source; whether volunteers must opt into each shift; qualification and role rules; capacity limits; treatment of waitlists and ties; whether assignments require approval; the fairness cohort and metric, if any; and what happens when no feasible assignment covers a shift.

#### P3 — “Allow coordinators to swap names.”

**Disposition: retain the coordinator capability, but make every swap a validated, reviewable change.**

Swaps can handle real-world changes, but a UI action that simply exchanges names can create a newly unqualified assignment, an overlap, an unwanted commitment, or a disruption to a published schedule. Better Impact’s product guide notes that some overlap warnings are overridable by administrators. A conflict warning should therefore not be mistaken for a hard system guarantee. [S02](sources/S02-better-impact-scheduling.md)

Before committing a swap, re-check both people against each target shift’s role, qualifications, availability, overlap, and configured capacity rules. If the receiving volunteer has not already accepted that shift, require an explicit confirmation or a coordinator-defined documented exception. Show the before-and-after assignments, affected shifts, and any warnings. Commit the pair as one operation so a partial swap cannot leave a vacancy. Record who changed what and when; notify only the people affected. These are design recommendations; the reviewed sources do not verify atomic swap, audit, or notification behavior for a chosen product.

A published assignment should be treated as a commitment. Timefold describes two replanning strategies: pin existing assignments or penalize changes. Either can preserve stability, but a coordinator must be able to deliberately release an assignment when a volunteer cancels. [S18](sources/S18-timefold-replanning.md)

A practical default is to block hard eligibility and overlap violations, show softer preference or fairness effects before saving, and require an explicit reason for any authorized override. The organization must decide which constraints may be overridden and by whom; this research does not establish a legal requirement or a universal policy.

#### P4 — “Email everyone the full roster.”

**Disposition: reject full-roster email as the default. Use access-limited schedules and audience-specific notices.**

The case asks for privacy-limited sharing. Better Impact documents a volunteer-controlled name-anonymity setting for its roster and says an administrator cannot override that setting. That is direct evidence that roster visibility is a product-level privacy concern, even though it does not tell us what this organization’s volunteers have chosen. [S02](sources/S02-better-impact-scheduling.md) Volunteer profiles can contain contact details, qualifications, interests, and availability, reinforcing the need to separate coordinator information from a shareable shift list. [S03](sources/S03-better-impact-profiles.md)

Emailing every volunteer everyone’s names and shifts exposes more information than a reminder requires and makes onward forwarding difficult to control. The reviewed sources do not establish that a full roster is necessary for volunteer coordination. VolunteerLocal describes scheduled email or SMS reminders but does not, in the reviewed page, document consent rules, quiet hours, delivery guarantees, or full-roster sharing. [S08](sources/S08-volunteerlocal-reminders.md)

Prefer: a volunteer sees their own commitments and only the team details the organization has explicitly decided to share; coordinators can see the operational roster; reminders state the recipient’s shift and a safe route to the schedule. If team-wide names are operationally useful, make that a configurable, purpose-limited view, explain the audience, and record the organization’s chosen visibility rule. Do not include phone numbers, email addresses, availability, or qualifications in a roster email by default.

**Decision still needed:** whether volunteers may see names of other people on the same shift, whether that depends on each person’s choice, and whether any role requires a wider roster. Also select the notification channel and retention/expiry behavior. Better Impact’s roster control is a product-specific example, not proof that the target platform has equivalent controls.

#### P5 — “Use local wall-clock timestamps.”

**Disposition: revise. Preserve local recurrence intent, but persist an unambiguous instant and the governing time zone.**

A local wall-clock time alone can be ambiguous when clocks change. Google’s DateTime documentation distinguishes civil-time components, UTC offset, IANA zone, and timestamp behavior; it warns about time-zone and daylight-saving changes and recommends a timestamp for a physical instant plus a separate time-zone field. [S16](sources/S16-google-datetime.md)

For the weekly recurrence, store the intended local start/end rule and the site’s IANA time-zone identifier. For each dated occurrence, resolve that rule to an unambiguous instant and retain the applicable offset/zone for display and auditing. Define how to handle a nonexistent local time during a spring-forward transition and a repeated local time during a fall-back transition. Display local time to coordinators and volunteers, while using the resolved instant for overlap checks, reminders, and integrations.

Do not store only a bare local date-time, and do not assume the machine’s current time zone is the food bank’s schedule zone. If the food bank operates multiple sites, the time zone belongs with the location or occurrence, not in a process-wide default. These implementation recommendations follow from the API’s documented time model; the Google source does not certify a particular application design.

#### P6 — “Test one ordinary week.”

**Disposition: keep an ordinary-week scenario as a smoke test, but it is not sufficient release evidence.**

An ordinary week cannot reveal ambiguous daylight-saving times, altered templates, stale imports, coordinator swaps, privacy exposure, inaccessible reminders, or a roster that has more demand than eligible people. The plan needs unit, scenario, integration, and user review proposals; none were executed in this research stage.

Proposed discriminating validation cases are listed below. They should be selected and run against the actual product and configuration after the unresolved policies above are decided.

### Proposed validation matrix

| Area | Discriminating case | Expected check | Status |
|---|---|---|---|
| Recurrence | Generate several weekly occurrences, then cancel one holiday occurrence and change a future template | Existing signups remain attached to stable occurrences; policy determines which future shifts change | Proposed; not run |
| Time zones | Generate a shift in a DST spring gap and one in a repeated fall hour; include a site-zone change | Every occurrence resolves to one intended instant, displays the intended local time, and overlap checks use instants | Proposed; not run |
| Eligibility | Candidate lacks a required role qualification or is unavailable for that occurrence | Candidate cannot be auto-assigned; coordinator receives a clear reason | Proposed; not run |
| Overlap and capacity | Candidate has an overlapping commitment or has reached the organization’s chosen capacity | Hard constraints block automatic assignment; any allowed override is explicit and logged | Proposed; not run |
| Assignment policy | Two eligible volunteers have different availability and stated preferences; repeat with a different name ordering | Alphabetical order does not determine outcome; selected tie/fairness policy produces explainable results | Proposed; not run |
| Supply shortage | More required slots than eligible, consenting volunteers | System reports uncovered slots and does not silently relax hard constraints | Proposed; not run |
| Swap | Swap volunteers across two shifts where one is ineligible or the recipient has not accepted | Invalid swap is blocked or awaits confirmation; valid pair is atomic and affected people are notified | Proposed; not run |
| Stability | Change one future shift after publishing the rest of the week | Existing confirmed assignments remain pinned or changes are explicitly presented for review | Proposed; not run |
| Privacy | Volunteer opens their schedule; another volunteer’s name is hidden; coordinator opens the operational roster | Views follow the selected sharing policy and do not expose contact or availability fields | Proposed; not run |
| Reminders | Send a test notice to a volunteer with one shift and to a coordinator with several shifts | Messages contain only recipient-appropriate details and provide an accessible schedule link | Proposed; not run |
| Accessibility and mobile | Keyboard-only and screen-reader review of signup, schedule, and cancellation on a phone-sized display | Critical actions and time/confirmation state are understandable without relying on color or pointer input | Proposed; not run |
| Import | Import a representative roster with duplicate, missing, malformed, and locale-specific dates | Errors are previewed and actionable; no silent identity, date, or availability corruption | Proposed; not run |
| Fairness monitoring | Compare assignment distribution for volunteers with different declared capacity and opportunity sets | Report exposes the chosen cohort, denominator, and metric; no unsupported “equal availability” assumption | Proposed; not run |

The final fairness case is diagnostic, not a command to equalize totals. Coordinators must choose the intended equity objective and eligible cohort before interpreting a score. Timefold’s documentation explicitly makes the selected data set and measure relevant to its score. [S17](sources/S17-timefold-fairness.md)

### Product and implementation alternatives

1. **Coordinator-reviewed signup.** Let eligible volunteers express interest or self-sign up, then let coordinators review capacity, coverage, and conflicts. Better Impact’s documentation demonstrates that signup and assignment can be separate, with approval and waitlist handling, though its exact behavior and plan must be checked in a real evaluation. [S02](sources/S02-better-impact-scheduling.md) This is the lowest-assumption pilot if the organization has not yet chosen allocation or fairness policy.
2. **Volunteer roster and reminders product.** VolunteerLocal documents jobs and shifts, optional iOS/Android app use, configurable reminders, and no-password schedule links. These are separate product capabilities, not evidence of recurrence, link security, consent controls, or suitability for imported recurring rosters. Verify those points with the vendor and a configured trial. [S07](sources/S07-volunteerlocal-jobs-shifts.md) [S08](sources/S08-volunteerlocal-reminders.md) [S09](sources/S09-volunteerlocal-mobile.md) [S10](sources/S10-volunteerlocal-no-password.md)
3. **Solver-assisted coordinator workflow.** Encode confirmed commitments, role eligibility, coverage, and non-overlap as hard constraints; only then add explicit preference or fairness objectives. OR-Tools is a code library with a relevant scheduling example. Google also offers a hosted API, but the reviewed overview says access is limited to trusted testers and requires an API key, and its reference documents product-specific units/priorities/time limits. [S12](sources/S12-ortools-v9.15-source.md) [S14](sources/S14-google-workforce-overview.md) [S15](sources/S15-google-workforce-rest.md) Neither route should be adopted before the team has an agreed policy, data model, and validation set.
4. **Managed scheduling product.** Better Impact documents different plan capabilities: full scheduling is listed for Growth/Impact, while Foundation has role assignment and hour logging. This is a vendor feature/plan statement, not current price or a verified quote. [S06](sources/S06-better-impact-plan-and-self-schedule.md) Compare the actual quote and configuration; do not assume a feature exists in the selected tier.

The case brief describes changing availability, mobile access, accessible reminders, privacy-limited sharing, and occasional roster imports. Treat all five as product requirements to validate rather than assuming feature-page claims satisfy them. Better Impact’s import guide specifies an XLSX worksheet name, exact column ordering/headings, and region-sensitive date formats; it says some profile imports and custom information can incur extra fees. Confirm the real template, supported fields, error handling, and price before committing to repeated import workflows. [S04](sources/S04-better-impact-import.md) Better Impact also published a February 2026 accessibility update covering screen-reader, keyboard, contrast, and responsive changes. This is a dated release claim, not an accessibility audit of the target flow. [S05](sources/S05-better-impact-release.md)

### Relevant issue, fix, regression, and release evidence

Timefold PR #2596 describes a solver defect where a custom move could be undone while leaving a stale score. The change snapshots and restores the pre-move score across three overloads, adds tests including a throwing postprocessor, was merged on 2026-08-18, and appears in the v2.6.0 release dated 2026-09-01. The release page later lists v2.7.1 dated 2026-10-06 with a performance fix affecting some very large data sets. [S20](sources/S20-timefold-pr-2596.md) [S21](sources/S21-timefold-releases.md)

This is a solver-engine issue, not a reported volunteer scheduling incident and not evidence that this case uses Timefold. It is useful as a validation lesson: a move that is reverted must restore score/state consistently, and exception paths deserve tests. If this project implements custom solver moves, add those regression cases; if it uses no solver or only built-in moves, this specific defect may be inapplicable. The source records support the reported change/release chain, not an independent reproduction of the bug.

### Evidence limits and unresolved decisions

- Product feature pages and support guides describe vendor-documented behavior; no paid account, trial, plan configuration, or end-to-end flow was inspected. Plan availability, prices, access controls, and behavior may differ by contract or configuration.
- The Google and solver examples concern employee scheduling. Their variables, priorities, time units, and fairness assumptions require a volunteer-specific mapping. No optimizer was executed, no schedule was generated, and no output was independently checked.
- Vendor web documentation can change. The source map records the exact page URLs, versions or release identifiers where available, access timestamp, locators, and local evidence-note hashes. Mutable pages were captured as observed at that time; this does not guarantee future page contents remain identical.
- Usage, billing, and account-level access were not observed. They remain unobserved/null in the source map rather than inferred.
- No legal conclusion is offered. The privacy recommendation is a product and data-minimization design response to the brief and the documented roster behavior, not a claim about a particular statute.
- No executable witness, integration, accessibility test, or manual product trial was run. All validation cases above are proposals and are explicitly marked not run.
- This run respected progressive retrieval: assignment and input map, the declared case brief, primary-source research, then discovery and source map written before the plan was revealed. The revealed plan was read only in its comparison phase. No parent, counterpart, evaluator, campaign history, or hidden plan source was read.
- A separate fresh critic and reviser round was not run because the assignment prohibits nested agents. This is a method limitation, not an independent review claim. The findings and proposals are the work of one research pass.

## Overall recommendation

Before implementation, replace P2 and P4, revise P5, and expand P6. Retain P1 and P3 only with explicit recurrence, consent, constraint, and published-schedule semantics. Start with coordinator-reviewed signup if allocation policy remains undecided. If the organization later chooses automation, compare a volunteer-specific model against stated operational policies and test hard feasibility separately from preference and fairness objectives. No fairness, privacy, recurrence, or solver behavior should be treated as resolved solely by a product feature page.
