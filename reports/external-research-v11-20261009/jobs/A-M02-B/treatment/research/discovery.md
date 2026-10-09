# ER11 A-M02-B / S08 — research discovery

Frozen before plan reveal at 2026-10-09T18:39:24Z

## Scope and method

The source of requirements for this discovery is the S08 brief and the task’s exact input map. The case asks for a food-bank volunteer scheduling product for 180 volunteers, changing availability, recurring shifts, predictable coordinator coverage, mobile access, accessible reminders, privacy-limited sharing and occasional roster imports. It also asks for competing products, constraint/optimizer approaches, fairness options, versioned implementation evidence and issue/fix/release evidence. It expressly prohibits invented legal requirements and equal-availability assumptions.

The input map declares no predecessors and no source roots. I independently selected public vendor help pages, official API documentation, tagged source code and release records. I opened the sources again by exact URL at 2026-10-09T18:31:55Z; the source map records URL, version/commit where available, locator, access operation and SHA-256 for each bounded evidence note. Vendor pages without release identifiers are marked mutable and unversioned. No product account, API key or demo was used. No source was downloaded or executed, and no optimizer or witness ran. Usage and billing are unobserved and recorded as null in the source map.

M02 calls for separate fresh critic and reviser passes, while this assignment forbids nested agents. I did not create or consult an agent, counterpart or evaluator. Therefore I cannot claim those independent passes or reproduce a separate-agent topology. The findings include a clearly labeled single-agent self-audit and preserve that protocol limitation for review.

Novelty relative to the case plan is intentionally unjudged here. The plan has not yet been revealed. This discovery is saved as a plan-independent comparison set; the exact plan clauses must be compared in the draft after freeze.

## Product landscape found independently

### Better Impact / Volunteer Impact

Better Impact is a volunteer-management suite whose scheduled Activities contain dated shift occurrences. Its documentation supports recurring patterns, disjointed shifts, single-date shifts, min/max headcount, auto-locking a full shift, qualification/status visibility, cutoffs, waitlists and volunteer self-scheduling. A waitlist is not automatically used to fill a vacancy; an administrator still notifies and assigns from it. [S01, S02]

The signup lifecycle is significant: signup means interest, assignment means the volunteer is placed, and confirmation may be a third step. Auto-confirm is on by default. The product supports immediate self-assignment or coordinator approval depending on activity settings. It also distinguishes system-wide schedule settings from activity-level controls. [S02]

This is a useful fit when the coordinator values a complete volunteer database, reporting and human approval around self-service. It is not evidence of an optimization engine: the reviewed pages describe activity setup, assignment, preferences and coverage views, not automatic fair allocation. An administrator may still assign with an overlap after a warning, and activity rules permit some admin overrides. The guide says a per-activity volunteer signup count cap is unavailable. A shift occurrence also cannot carry a leader, location or note in the documented model; verify whether an Activity-level or separate field can represent the food bank’s needs. [S01, S02]

Availability has an important boundary. A volunteer profile carries General Availability, and activity visibility can be filtered by it, but the documentation describes this as visibility/filtering and provides override paths; it does not establish a global hard feasibility guarantee for every administrator assignment. If changing weekly availability must make an assignment impossible, test that exact rule rather than infer it from a profile field. [S01, S03]

Privacy behavior is concrete in the reviewed scheduling guide. Administrators can choose whether volunteers see who else is scheduled, and a name/photo appears only if that volunteer permits name visibility. Admins cannot override the volunteer’s anonymity choice, though admins still see names. This offers a useful reference for least-sharing defaults, though the settings apply at account or activity scope rather than necessarily matching every desired field-level policy. [S02]

The import path is operationally meaningful. Better Impact’s published instructions require an XLSX template, a UserData worksheet, exact ordered columns and region-specific date formats; bulk import and some custom fields such as availability may be billable. That can make an otherwise suitable product a poor fit for frequent roster updates unless the one-time import is adequate and the recurring process is priced and rehearsed. [S04] The vendor’s feature page says full scheduling is gated to Growth and Impact plans, not Foundation, so feature and price checks belong in selection. [S06]

On accessibility, Better Impact’s February 2026 release notes report screen-reader, keyboard, contrast and responsive improvements, and the product reports scheduled email support from one hour to thirty days in advance. These are vendor claims, not an audit result or a guarantee that the relevant screens and notifications pass the food bank’s own checks. [S05]

### VolunteerLocal

VolunteerLocal presents a different, event/job-first model: a job captures work and qualifications; shifts can be dated, date-only, placeholder or self-reported; shifts may have a location and other attributes. Its mobile app is optional on iOS/Android and is advertised for selecting shifts, viewing a schedule and cancelling, with administrator-controlled functions. Scheduled email/SMS reminders can be sent multiple times before a shift. [S07, S08, S09]

The no-password option uses special links or the app to manage a volunteer’s personal information and schedule. This may reduce friction for infrequent volunteers, but the reviewed page does not specify link expiry, revocation, identity checks or auditing. Evaluate forwarded links, shared devices, lost phones and cancellations. Do not treat the marketing page as proof that the access model meets the food bank’s privacy needs. [S10]

The reviewed VolunteerLocal material is vendor feature content. It does not establish recurring-series and exception semantics, qualification enforcement, slot fairness, conflict handling, notification delivery policy, price, application accessibility or import/export constraints. These remain demo and contract questions. A useful discriminator is whether the food bank needs an event signup page with minimal login friction or a maintained year-round roster and recurring schedule.

## Optimizer and constraint approaches

### Model before solver

The 180-person roster does not itself require optimization. Model each occurrence as a dated interval in the food bank’s local time zone, with required count, job/role, skills or qualifications, location, open/closed status, recurrence lineage and assignment state. Store weekly availability separately from date-specific exceptions; treat unavailable times and qualifications as eligibility restrictions only if the food bank confirms they are hard rules. Keep a recurrence rule and expand it over a chosen planning horizon; preserve each occurrence identity so an exception or cancellation does not silently rewrite the series.

A useful initial constraint hierarchy is:
1. Hard: required role/qualification, explicit unavailability, no overlapping assignments, shift capacity, confirmed/pinned commitments, and any user-approved safety or operational limit.
2. Coverage: required people per occurrence; if insufficient qualified volunteers are available, report the uncovered count and reason instead of silently violating hard rules.
3. Soft: preferences, continuity, fair distribution of effort and less-desirable work, and low-disruption changes.
4. Coordinator review: approve or reject a proposal, see unmet coverage, exceptions and reasons, then publish. Record the pre-publication schedule and explain later changes.

The distinction between preference and a hard restriction is a product policy decision. A solver may relax a soft constraint and still report a feasible schedule. Volunteer-facing language must make that difference plain.

### OR-Tools CP-SAT

OR-Tools is a concrete self-hosted candidate for a custom assignment model. Its versioned v9.15 Python example creates Boolean variables, pins some assignments, represents requests with signed integer weights, models hard and soft sequence/weekly limits, enforces coverage, and minimizes an integer weighted objective. The official employee-scheduling tutorial shows exactly one worker per required shift and at most one shift per worker/day, followed by request satisfaction. These are employee/nurse implementation patterns, not food-bank rules or ready-made volunteer features. [S11, S12]

CP-SAT works with integer terms. A fairness objective involving fractional ratios needs deliberate integer scaling or another score design, with tests for rounding and weight dominance. A custom model must also add availability, roles/qualifications, variable headcount, imports, recurrence generation, explanations and non-disruptive replanning. The examples do not demonstrate those features for this case. The observed latest OR-Tools release is v9.15; its tag/commit is recorded in the source map. [S12, S13]

### Google Workforce Scheduling API

The hosted workforce API is different from the local OR-Tools library. It supports employee-to-shift assignment, roles, skills, coverage, work-time limits, rest periods, requests and priority relaxation, but requires trusted-tester access and an API key. It models employees, contracts and budgets; volunteer data should not be sent without explicit access, privacy and account review. No access was requested or exercised. [S14]

The REST schema is precise enough to inform a custom constraint vocabulary. Role coverage defaults to mandatory, skill coverage to low, scheduling and resource constraints to medium, and shift requests to low. Scheduling constraints are time-windowed; the interval starts inclusive and ends exclusive. Work time uses integer minutes, day/shift limits use integer counts, and minimum rest uses integer minutes. The one-minute default solve limit is not a hard wall-clock bound; an infeasible or timed-out response may have no assignments. A valid feasible/optimal result avoids overlapping assignments and mandatory violations. [S15]

Its DateTime type supports an IANA time zone, UTC offset or local civil time when no offset is set. Some date components can be omitted. The official advice warns about future time-zone changes and recommends physical timestamps plus a separate time-zone field where appropriate. For a recurring local shift, preserve intended local wall time and IANA zone, generate dated occurrences, and retain each published occurrence’s instant/offset. Test daylight-saving transitions; a fixed UTC offset is not a complete substitute for the venue’s zone. [S16]

### Timefold Solver and managed model

Timefold has two materially different offerings in the reviewed docs. Its open-source Solver library is a custom-model path; 2.7.1 documentation describes fairness scoring through a load-balance collector and non-disruptive replanning. A separate managed Employee Shift Scheduling model exposes employee scheduling as a platform service. These should not be conflated: a hosted API has data-transfer, access and account questions; an embedded library requires the product team to write and maintain its domain model. [S17, S18, S19]

The Solver fairness collector scores an explicitly grouped load distribution, such as shift-assignment counts per employee. Its unfairness is dimensionless, rounded to six decimals and only comparable within one dataset. The docs recommend BigDecimal for fractional fairness precision; if scaled integers are used, score weights must be retuned. This is a mechanism, not a volunteer fairness policy. The custom model must choose whether to balance shift count, hours, task effort or undesirable shifts and who belongs in the comparison group. The source example groups assignments; a model should include eligible volunteers with zero assignments if policy requires them. [S17]

Timefold’s managed employee model instead describes FTE-adjusted minutes and an eligibility condition for balancing work time. That may inspire an availability-adjusted metric, but the employee/FTE model does not automatically transfer to unpaid volunteers; the food bank must choose a defensible denominator and weighting policy. [S19]

For predictable coverage, Solver documentation offers pinning published assignments so they cannot change and soft change penalties where changes are allowed if the gain justifies disruption. The food bank still needs to define published, confirmed, emergency override and coordinator approval. [S18]

## Fairness options and decision conditions

Do not equate equal availability, equal eligibility or equal contribution. The brief expressly says not to assume equal availability. Total shifts or hours can mislead if people differ in roles, declared availability, desired commitment, maximum load, task duration or eligibility. Fairness should be explicit and explainable, and should not overpower coverage or hard unavailability.

Candidate policies worth comparing:
- Equal shift counts among volunteers eligible for the same role and period. Easy to explain, but treats short and long or difficult shifts equally.
- Balance hours or task effort among eligible volunteers. Better when shift durations differ; still needs policy for volunteers who opt into little time or have few eligible shifts.
- Availability-adjusted burden, such as assigned hours divided by declared available hours or eligible opportunity count. This avoids assuming equal availability, but depends on current self-reported availability and can behave badly with tiny denominators. Require a minimum denominator, transparent cap or coordinator review.
- Rotate or balance less-desirable shifts separately from total hours. Useful if packing, cold storage, late shifts or cleanup differ in burden, but the food bank must identify which work is undesirable and how much.
- Preference-first self-signup with capacity limits and coordinator intervention. Low algorithmic complexity, but early access and popular shifts can concentrate opportunities.
- No automatic fairness optimization in the first release: expose transparent counts and let coordinators assign under an explicit written rule. This is viable until volunteers and coordinators choose a fairness goal.

An optimizer objective can be lexicographic: respect hard eligibility and coverage commitments, then maximize coverage with visible gaps, avoid moving confirmed assignments, honor preferences and finally optimize the chosen fair-share metric. Which soft objective comes first is a user decision. A weighted sum can make a large fairness weight silently outweigh preference or change cost; test and explain score trade-offs.

## Data, communication and privacy implications

- Availability: distinguish a recurring weekly window from a one-off absence, and define the effect of a last-minute change on accepted assignments. Never silently overwrite a confirmed commitment because a profile changed.
- Recurrence: use a named local time zone, explicit start/end dates and per-occurrence exceptions. Define whether coordinators can edit one occurrence or the remaining series, how far ahead schedules are generated, and whether a holiday closure is skipped or a special shift.
- Imports: use field mapping, preflight validation, duplicate review and a change report. Preserve stable source IDs and import timestamps. Do not ingest phone/email/notes if the scheduler needs only a pseudonymous volunteer ID, qualifications, availability and contact preference. Better Impact’s published import route is a paid, strict XLSX workflow; compare its recurring import costs with occasional manual import and direct export. [S03, S04]
- Privacy: separate volunteer-visible information from coordinator-only information. Prefer a default view showing each volunteer their own assignments and coverage/openings without another volunteer’s contact details. If showing names, honor an explicit user setting; decide whether headcount alone is enough. Check integrations and solver APIs for where identifiers and availability leave the system. Better Impact documents name visibility controls; other reviewed pages do not establish a comparable policy. [S02, S10, S14, S15]
- Mobile and accessibility: decide whether responsive web is enough or an installed app is needed. For reminders, offer channel preferences, accessible plain-language content, an actionable schedule link and changed/cancelled notices; do not expose other volunteers’ data in a reminder. Better Impact reports accessibility improvements; VolunteerLocal advertises a mobile app. Neither is a hands-on audit of this case’s screens. [S05, S08, S09]
- Import/export and retention: establish who can upload/download rosters, whether changes merge or replace, what happens to missing rows, retention and deletion, and how rejected rows are corrected. None of the reviewed material determines the food bank’s retention policy.

No legal requirement is inferred. Confirm jurisdiction, notification consent and record-retention obligations with responsible staff if they become in-scope; this discovery does not state what those obligations are.

## Issue, fix and release evidence

A relevant solver evolution chain is Timefold PR #2596. It fixed a stale cached score after undoing a temporary search move, snapshots/restores the score across three overloads, and added regression tests, including a postprocessor exception. Review found failing tests before later revisions and approval. The merged commit is in Timefold Solver 2.6.0. The PR discussion says the defect matters for custom phases and does not affect built-in phases. The current release list also shows v2.7.1 released October 6, 2026 with a fix for a performance regression on some very large data sets. This is evidence that solver internals and releases evolve; it is not a volunteer-scheduling incident and does not show an issue at 180 volunteers. [S20, S21]

No relevant issue/fix chain was inspected for Better Impact or VolunteerLocal, and no issue-to-release evidence was established for the Google hosted workforce API. The reviewed source set supports one concrete solver fix chain, with direct applicability limits stated above. Do not infer these products have no bugs because a public chain was not found.

## Executed work, proposed validation and open decisions

Executed in this research stage: public-source retrieval, inspection of the exact pages and tagged source listed in the source map, and preparation of evidence summaries. No product demo, account, import, solver run, source-code execution, accessibility audit, user interview or runtime witness was performed. No qualified sandbox was declared in the input map; proposals below are not completed checks.

Proposed discriminating validations:
1. Create an anonymized sample of 180 volunteers with intentionally uneven weekly and date-specific availability, overlapping preferences, different qualification sets and more volunteers than some shifts need. Verify hard eligibility/overlap/capacity constraints and list every under-covered role/occurrence with a reason.
2. Generate recurring shifts around daylight-saving transitions and a one-off holiday/closure. Edit one occurrence and then the rest of a series; verify only intended occurrence IDs change and published local time remains correct.
3. Change availability after publication, cancel one volunteer and add demand. Verify confirmed assignments stay pinned or proposed moves are shown with reasons and coordinator approval.
4. Use an infeasible dataset with one role-qualified volunteer unavailable for a mandatory slot. Verify the system reports the gap instead of silently assigning an unqualified person or labeling a soft result hard-feasible.
5. Compare equal-count, hour/effort, opportunity-normalized and unpopular-shift rotations on the same dataset, including one volunteer with very little availability and one role with a single eligible volunteer. Review outputs with volunteers and coordinators before adopting a policy.
6. Test import preview, row-level errors, duplicates, regional date formats, repeated import, merge/replacement and export reconciliation with an anonymized roster. Confirm vendor price and whether recurring changes are billable.
7. Test least-sharing settings on volunteer, coordinator and administrator roles; inspect emails/texts and special-link behavior for names, contact data, expiry, revocation, shared devices and cancellations.
8. Test keyboard-only navigation, screen reader, mobile browser and any native app; verify readable reminder timing, timezone, cancellation/action path and changed-shift messages.
9. For a solver candidate, benchmark realistic weekly horizons and a larger stress case, repeat with multiple seeds/settings, preserve status/runtime/coverage/fairness/change metrics, and compare to a coordinator-built baseline. Do not use one optimal label as a product-quality verdict.
10. For managed APIs, first use synthetic/pseudonymous data and confirm access, data-processing terms, price, timeouts and error semantics before any real roster is transmitted.

Decisions for the plan/draft stage or later product owner: which roles/qualifications are hard; who confirms a shift and when; self-signup or request/approval; planning horizon; recurrence/time-zone policy; fairness unit, denominator, undesirable-work categories, cohort and tie-breaks; whether to lock confirmed schedules; coordinator override/audit rules; roster visibility; reminder channels/preferences; acceptable vendor/import budget and data boundary; and whether 180 volunteers justify a custom optimizer now.

## Single-agent self-audit before plan reveal

Potential overclaims were checked against sources: Better Impact availability is a visibility/filter concept with overrides, not a universal hard constraint; VolunteerLocal recurring-shift behavior and security details are unverified; Google Workforce is a gated employee API, not a volunteer product; Timefold employee FTE fairness is not a volunteer policy; PR #2596 is limited to custom solver phases; and no runtime or accessibility test was executed. The independent critic and reviser requested by M02 were not run because nested agents are prohibited in this assignment. Preserve these limitations when comparing the exact plan.
