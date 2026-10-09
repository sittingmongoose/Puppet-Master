# Independent critic review — S08 volunteer shift scheduling

**Block / arm / stage:** A-M02-B / control / critic  
**Review date:** 2026-10-09  
**Scope:** original S08 brief, complete own-arm research draft and discovery, exact revealed plan, predecessor source map and bounded notes, and independent spot-checks of the cited governing public primary evidence.  
**Boundary:** this is a critique, not a replacement draft. I did not inspect any other arm, campaign history, evaluator material, private provider internals, or data. No product, solver, import, accessibility audit, or schedule-generation check was executed.

## Overall assessment

The research draft is a strong and largely accurate response to the brief. It preserves the brief's key uncertainty (including non-equal availability), compares volunteer-management suites with coordinator-led, self-signup, and two distinct solver approaches, investigates a real source-history chain, treats all six revealed clauses, and separates proposed validations from work actually performed. Its recommendation is deliberately conditional rather than a product purchase or fairness-policy decision.

There is one material evidence-applicability correction for the next stage: the Volgistics page cited for P1 documents a **volunteer's recurring schedule entry**, not a recurring opening or general shift-template engine. The product's schedule overview explicitly distinguishes those objects and says coordinators cannot make or change openings. This limits what S09 can establish about P1, although it does not undermine the draft's underlying recommendation to define occurrence/series behavior and test it.

The time-zone analysis is technically sound when read conditionally. Retain its distinction between local time with a zone and a floating, zone-less timestamp, and make the separate RFC rules for a DATE-TIME value and an RRULE-generated instance easy to see.

## Material finding

### M01 — P1 evidence describes volunteer assignment recurrence, not a shift-opening template

**Severity:** material applicability limitation; not a rejection of the proposed product requirement.  
**Affected text:** P1 disposition and the Volgistics product comparison; indirectly the product-comparison scenario for a recurring opening and one-date exception.

The draft says the Volgistics “Regular” behavior shows why series edits/removals may affect past and future dates and why an end date plus a separately handled one-date exception is useful. That is a fair account of the cited help page's volunteer-record workflow, but the object matters. The page describes regular entries on an individual volunteer's schedule. Its one-date adjustment instructions say to remove that date's recurring volunteer entry and add it back with different times; it does not document a first-class exception mechanism for a reusable shift template. [C03](sources/vendors.md#c03--volgistics-recurring-schedule-entry-editing)

The schedule overview separately says coordinators can edit volunteer entries when configured but cannot make or change schedule openings. [C04](sources/vendors.md#c04--volgistics-schedule-overview) So the P1 evidence does not show that an organization can edit a recurring **opening/template** one date at a time, nor that a coordinator can administer that opening workflow in the cited product.

**Critic disposition:** keep P1 as a conditional correction/design requirement. Narrow the vendor illustration to volunteer recurring entries, and do not use it as proof of opening/template semantics. In the later product evaluation, test (a) the opening or template series, (b) a single dated occurrence exception, (c) the scope of a future-series edit, and (d) preservation of published/past assignments as separate cases. For a custom product, the recommendation to make that scope explicit remains sound. This distinction is supported by the vendor's own separation of openings from volunteer entries, not an inference about what all schedulers must do.

## Minor findings and precision notes

### m01 — Keep the P5 local-time correction explicitly conditional

The exact clause “Use local wall-clock timestamps” is underspecified. If it means a recurring site shift expressed as local wall-clock time **plus the site's time-zone reference**, that can preserve the intended weekly service time. If it means a zone-less local DATE-TIME used as a fixed instant, RFC 5545 calls that floating time and says a fixed time should use UTC or local time with a zone reference. The draft already draws this boundary by rejecting only unzoned fixed timestamps while recommending local time plus an explicit site zone. Do not broaden its rejection to site-local recurrence itself. [C01](sources/standards.md#c01--rfc-5545-date-time-and-recurrence-rfc-editor)

There is a second distinction worth retaining in the validation language: RFC 5545 §3.3.5 interprets a nonexistent TZID DATE-TIME using the pre-gap offset, while §3.3.10 requires an RRULE-generated nonexistent local instance to be ignored and not counted. These are different inputs/operations, not competing summaries of one rule. The draft gives both behaviors correctly; validation should separately test an initial DTSTART-like value and a later recurrence instance, then verify the application alerts a coordinator if the chosen recurrence behavior creates an uncovered service date. The RFC governs iCalendar representation, not the food bank's operational gap policy. [C01](sources/standards.md#c01--rfc-5545-date-time-and-recurrence-rfc-editor)

### m02 — Keep RFC 5545's scope separate from an application's zone database

The draft's “explicit site timezone identifier” is a sensible application requirement. RFC 5545 uses a TZID parameter that references timezone information; it is not itself a complete rule that every application must use a particular named-zone database or implementation. If calendar export/interchange becomes a requirement, validate that the exported TZID and timezone definition are understood by the recipient. This is a precision note, not a defect in the proposed site-zone model. [C01](sources/standards.md#c01--rfc-5545-date-time-and-recurrence-rfc-editor)

### m03 — Keep the OR-Tools “off” choice visible when describing exactness

The pinned v9.15 code creates Boolean assignment variables and applies exactly-one across the shift options, including its Off shift. It then applies a lower bound to daily work-shift demand and can penalize over-coverage. The draft's main description is accurate and the discovery's “at-most-one work shift” paraphrase is semantically reasonable, but later reuse should avoid suggesting the sample forces every person to work each day. It forces exactly one modeled choice including Off. The sample is not a scale benchmark. [C13](sources/solvers.md#c13--or-tools-v915-pinned-shift-scheduling-sample)

### m04 — The Timefold fairness and evolution-chain boundaries are accurately stated

The 1.35.x hosted API documentation confirms that balance-time-worked is a soft rule, applies when at least two employees are eligible for the same shifts, and uses 100 times the standard deviation of FTE-adjusted minutes. It also says a shift may still be assigned when fairness is not achieved. The separate constraints guide confirms active soft weights default to 1 and the 1,000,000,000,000 upper limit. The draft correctly treats these as hosted-API mechanics, not volunteer policy or open-source Solver behavior. [C11](sources/solvers.md#c11--timefold-hosted-employee-shift-scheduling-fairness-docs-135x) [C12](sources/solvers.md#c12--timefold-hosted-constraint-priorities-and-weights-docs-135x)

The public history also supports the bounded issue/change/fix chain: #492 asks for a quickstart fairness example; #517 merges that example; #980 states it is required for #517 and fixes Python load-balance casts. The source concerns a quickstart implementation, not a production scheduling incident. The draft correctly makes that limitation explicit. [C14](sources/solvers.md#c14--timefold-quickstart-fairness-issue-492) [C15](sources/solvers.md#c15--timefold-quickstart-fairness-pr-517) [C16](sources/solvers.md#c16--timefold-solver-load-balance-cast-pr-980) [C17](sources/solvers.md#c17--timefold-quickstart-fairness-implementation-commit) [C18](sources/solvers.md#c18--timefold-solver-python-cast-fix-commit)

## Clause-by-clause independent disposition

| Plan clause | Critic disposition | Assessment |
|---|---|---|
| **P1 — Generate recurring shifts from a weekly template.** | **Correction remains justified; product evidence must be scoped.** | A weekly series needs explicit timezone, effective dates, occurrence-exception and edit scope. Preserve M01: S09 supports claims about a volunteer's regular assignment, not a template/opening. The proposed synthetic opening/exception test is appropriate. |
| **P2 — Assign the first available volunteer alphabetically.** | **Reject as allocation policy; tie-break remains optional and conditional.** | Alphabetical order does not define confirmed availability, qualifications, coverage priority, or the user's chosen fairness objective. The draft labels the disadvantage as an inference rather than a measured outcome and retains alternatives. A tie-break should be auditable and must not override hard eligibility/absence rules. |
| **P3 — Allow coordinators to swap names.** | **Retain the coordinator workflow with safeguards; leave volunteer-initiated swaps as a decision.** | Rechecking role, overlap, availability and coverage and recording the change are appropriate proposed controls. They are not demonstrated product features; the draft does not claim they are. Its swap validation scenario should remain proposed until an implementation or vendor configuration is actually tested. |
| **P4 — Email everyone the full roster.** | **Reject blanket distribution; preserve a user decision on peer-name visibility.** | The privacy-limited brief supports the draft's distinction between individual reminders, filtered views, aggregate coverage, and optional peer-name visibility. Volgistics demonstrates one configurable pattern but does not select a privacy default for this organization. |
| **P5 — Use local wall-clock timestamps.** | **Conditional correction, not rejection of site-local recurring time.** | A named site zone plus local recurrence is compatible with the schedule's human meaning; a floating timestamp cannot by itself identify a fixed instant. Preserve both RFC transition rules and a coordinator alert policy. |
| **P6 — Test one ordinary week.** | **Retain as smoke coverage, expand the validation scope.** | The multi-scenario plan adds scarcity, conflicts, fairness, recurrence edits, DST, swaps, privacy, reminders, imports, accessibility, and product comparison. The draft accurately marks all of these as proposed rather than executed. |

## Brief-obligation audit

| Obligation | Critic assessment |
|---|---|
| **O1 — Discover useful unfamiliar tools/products and different approaches.** | **Met.** Better Impact and Volgistics are relevant suite candidates; coordinator assignment, volunteer self-sign-up, hybrid workflow, OR-Tools CP-SAT, open-source Timefold Solver, and the distinct hosted Timefold API are materially different paths. The research correctly leaves product choice open. |
| **O2 — Primary behavior, defaults, units/types, limits, applicability.** | **Met with M01 scope correction.** The draft pins OR-Tools code, records hosted Timefold defaults/limits/FTE semantics, and states the samples' and vendor pages' limits. Continue to distinguish volunteer assignment recurrence from opening/template recurrence. |
| **O3 — Issue/fix/regression/release evolution.** | **Met.** The issue → quickstart PR → required solver cast fix is a traceable public code evolution chain, and its non-production scope is stated. |
| **O4 — Compare every exact P clause after reveal.** | **Met.** P1–P6 have explicit dispositions and conditions. M01 limits one cited product analogy but does not leave a clause unreviewed. |
| **O5 — Retain alternatives, conditions, constraints, disagreement, uncertainty.** | **Met.** The draft retains different staffing/fairness choices, vendor fit uncertainty, open user decisions, and the no-equal-availability constraint in a coherent narrative. |
| **O6 — Discriminating validation, executed vs proposed.** | **Met.** The proposed matrix differentiates the main choices and failure modes; the draft does not imply that a product trial, solver run, accessibility audit, or import actually happened. |

## Critic conclusion and handoff

The research can proceed to revision without changing its overall direction. The reviser should make M01's evidence boundary explicit wherever the Volgistics recurrence example supports P1, and preserve the P5 conditional timezone language. Treat the fairness metric, minimum-versus-target coverage, peer-name defaults, reminder behavior, coordinator swap authority, roster identity/update rules, recurrence horizon, and zone-gap handling as unresolved organization decisions unless new evidence is obtained.

No legal requirement, conformance status, vendor fit, price/tier, schedule quality, or runtime performance was established. No correction or rejection in the thin plan is asserted as an executed product outcome. The only implementation-level execution here was reading the permitted materials and public primary pages; all product/runtime/accessibility validations remain proposals.

