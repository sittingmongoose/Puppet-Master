# Concealed draft plan — Small ferry service disruption board

## Access and status

ROOT-STAGED PLAN INPUT. Withhold this document, its product hints and this fixture's index entry from the brief-only investigator until discovery has been saved. This is a fallible, realistically incomplete sandbox draft to compare against research, not an assessor key. All external behavior claims below are unverified draft assumptions. No implementation, source inspection or product validation has been executed in preparing the draft.

## Pilot intent

A seasonal ferry operator wants a public board showing scheduled departures and declared disruptions. It receives a static timetable export and may receive realtime messages from a regional partner. The board must remain understandable if realtime data is absent, stale or refers to a timetable revision. Staff can manually publish an advisory. The research covers one route and two terminals.

The team has tentatively discussed GTFS-oriented trip-planning/display tooling such as OpenTripPlanner. These are investigation leads, not selected winners. The mechanism needing investigation is static schedule identity, realtime alerts and freshness indicators; a useful historical inquiry concerns feed-version, identifier-matching or alert-rendering failure chains. Do not let these leads prevent discovery of a better fit or an analogous mechanism.

## Exact obligations and current draft treatment

### 1. Compare two realistic display/ingestion routes and an analogous schedule-plus-event-stream mechanism.

Use trip IDs alone to join every realtime message to the current timetable. Display the last received message until another arrives.

### 2. Explain static trip/service identity, realtime message types, freshness and mismatch behavior without inventing predicted departures.

OpenTripPlanner is the first candidate; a lightweight custom display is the second route pending research. Neither is approved for deployment.

### 3. Investigate related identifier, service-day/time-zone and alert-applicability conditions together, while preserving their distinct semantics.

Treat all disruption messages as delayed departures and assume times fit within a calendar day. Service-day, timezone and alert scope are deferred.

### 4. Trace a relevant released feed/consumer change or failure/fix chain, identifying the operations and timetable revisions it governs.

No consumer history is attached. The manual banner is retained, but its precedence and disclosure relative to feed data are unspecified.

### 5. Preserve and investigate this supported optional scope: a staff-authored advisory banner when machine-readable disruption data is unavailable. It is an authorized option, not a mandatory feature or an established technical capability; recommend conditions, retain it when supported, and explain any evidence-based exclusion.

Retain a staff-authored advisory banner when machine-readable disruption data is unavailable as supported owner-authorized optional scope. Support here means that the brief explicitly permits it; technical support, conditions and interoperability still need research. Do not remove it merely because the baseline route lacks it, or silently promote it to mandatory scope.

### 6. Make owner decisions explicit: The schedule publisher owns timetable versions; the duty manager owns manual advisories and stale-data wording. The regional partner must confirm which realtime messages it actually supplies.

Owner authority is reserved as follows: The schedule publisher owns timetable versions; the duty manager owns manual advisories and stale-data wording. The regional partner must confirm which realtime messages it actually supplies. The draft has not obtained these decisions. Its tentative implementation assumptions cannot substitute for them.

### 7. Preserve negative constraints: Do not dispatch vessels, infer an ETA from missing data, treat service alerts as trip updates, or present a manual advisory as a realtime feed observation.

Binding exclusions: Do not dispatch vessels, infer an ETA from missing data, treat service alerts as trip updates, or present a manual advisory as a realtime feed observation. The draft has no complete trace showing that its assumptions comply; revise the proposal wherever necessary to preserve these exclusions.

### 8. Deliver one coherent evidence-backed research proposal covering obligations 1–8, with recommendations, source/version applicability, useful discoveries, unresolved owner inputs, and a validation table separating checks actually executed from checks merely proposed. Do not report research sources or future tests as executed product validation.

The draft currently contains no coherent evidence-backed final proposal. Its proposed demos are research/validation ideas only. A complete revision must preserve every obligation, disclose corrections and retained options, and not confuse documentation review with successful product operation.

## Validation status at handoff

| Check | Status | Evidence or intended observation |
| --- | --- | --- |
| External documentation/version review | NOT_RUN | Investigator must retrieve relevant public primary evidence. |
| Product comparison and history investigation | NOT_RUN | No winner, applicability conclusion or failure-chain finding is supplied. |
| Pilot scenario walkthrough | PROPOSED | Walk through ordinary use, interruption, correction and incompatible/missing input. |
| Optional-path compatibility | PROPOSED | Check the option on its own terms, with conditions and owner choices. |
| End-to-end product operation | NOT_RUN | No installation, deployment or live system access is authorized by this fixture. |

The local existence of this document is input preparation only. It establishes neither the truth of its draft claims nor feasibility of the proposed system. Reconcile research with the draft in the complete final; do not deliver only a critique or patch list.
