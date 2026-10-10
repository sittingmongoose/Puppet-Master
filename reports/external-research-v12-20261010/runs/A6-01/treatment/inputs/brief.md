# Small ferry service disruption board

## Assignment

A seasonal ferry operator wants a public board showing scheduled departures and declared disruptions. It receives a static timetable export and may receive realtime messages from a regional partner. The board must remain understandable if realtime data is absent, stale or refers to a timetable revision. Staff can manually publish an advisory. The research covers one route and two terminals.

You have a 60-minute whole-topic research envelope. Produce a planning proposal, not an implementation. Use public primary documentation, relevant public source code and released issue/fix history where they bear on the proposal. Discover realistic products, mechanisms and alternatives independently; no product, source or conclusion is preselected. A bounded historical example and useful unfamiliar opportunities matter more than an exhaustive catalogue. Clearly distinguish observed external behavior, your inference and a local product choice.

## Exact numbered obligations

1. Compare two realistic display/ingestion routes and an analogous schedule-plus-event-stream mechanism.
2. Explain static trip/service identity, realtime message types, freshness and mismatch behavior without inventing predicted departures.
3. Investigate related identifier, service-day/time-zone and alert-applicability conditions together, while preserving their distinct semantics.
4. Trace a relevant released feed/consumer change or failure/fix chain, identifying the operations and timetable revisions it governs.
5. Preserve and investigate this supported optional scope: a staff-authored advisory banner when machine-readable disruption data is unavailable. It is an authorized option, not a mandatory feature or an established technical capability; recommend conditions, retain it when supported, and explain any evidence-based exclusion.
6. Make owner decisions explicit: The schedule publisher owns timetable versions; the duty manager owns manual advisories and stale-data wording. The regional partner must confirm which realtime messages it actually supplies.
7. Preserve negative constraints: Do not dispatch vessels, infer an ETA from missing data, treat service alerts as trip updates, or present a manual advisory as a realtime feed observation.
8. Deliver one coherent evidence-backed research proposal covering obligations 1–8, with recommendations, source/version applicability, useful discoveries, unresolved owner inputs, and a validation table separating checks actually executed from checks merely proposed. Do not report research sources or future tests as executed product validation.

## Research boundaries and deliverable

Keep the investigation at the pilot scale above. No installs, accounts, production access, purchases or live writes are needed. Read-only public retrieval is appropriate; any permitted local discriminating check must be disclosed with its actual inputs and result. A check you did not run remains proposed or NOT_RUN. Deliver a complete proposal with a compact comparison, evidence-linked recommendations and prioritized validation; there is no requirement to build a prototype. Owner inputs may remain explicit decisions, but they do not excuse investigating publicly answerable questions. This brief is the complete discovery input.
