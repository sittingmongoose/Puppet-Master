# Concealed draft plan — Delayed community weather-station observations

## Access and status

ROOT-STAGED PLAN INPUT. Withhold this document, its product hints and this fixture's index entry from the brief-only investigator until discovery has been saved. This is a fallible, realistically incomplete sandbox draft to compare against research, not an assessor key. All external behavior claims below are unverified draft assumptions. No implementation, source inspection or product validation has been executed in preparing the draft.

## Pilot intent

A volunteer weather club aggregates temperature and rainfall observations from ten stations. Some use a low-power radio gateway; others upload CSV after an outage. The club publishes a historical chart with an explicit freshness indicator and preserves raw observations for correction. Devices may reboot or buffer readings for hours. The system is informational and must never control equipment or issue hazard warnings.

The team has tentatively discussed The Things Stack-oriented ingestion or MQTT/time-series archive tooling. These are investigation leads, not selected winners. The mechanism needing investigation is store-and-forward telemetry, replay identity and event-time ordering; a useful historical inquiry concerns released replay/deduplication/time-ordering issue chains. Do not let these leads prevent discovery of a better fit or an analogous mechanism.

## Exact obligations and current draft treatment

### 1. Compare two ingestion/archive routes and an analogous delayed-event processing mechanism, including low-power and CSV tradeoffs.

Use gateway arrival time as observation time and discard anything older than the current chart point. A restarted device is presumed to retain globally unique sequence numbers.

### 2. Explain observation time versus arrival time, duplicate/replayed messages, rebooted sequence counters and correction lineage.

The Things Stack and a generic MQTT pipeline are named as possible routes. Network delivery and archive replay are not yet separated.

### 3. Research the boundary between radio/network delivery behavior, application replay policy and historical-chart interpretation.

Keep the CSV backfill option as authorized scope, but append its rows without checking identity or marking corrections. Assume network deduplication removes all application duplicates.

### 4. Investigate a relevant released ingestion/time-ordering failure or fix chain and identify what remains dependent on the club’s actual devices.

No released replay/time-ordering history has been read. A future connected demo is expected to prove behavior during multi-hour outages.

### 5. Preserve and investigate this supported optional scope: a documented CSV backfill path with staff-reviewed duplicate and correction handling. It is an authorized option, not a mandatory feature or an established technical capability; recommend conditions, retain it when supported, and explain any evidence-based exclusion.

Retain a documented CSV backfill path with staff-reviewed duplicate and correction handling as supported owner-authorized optional scope. Support here means that the brief explicitly permits it; technical support, conditions and interoperability still need research. Do not remove it merely because the baseline route lacks it, or silently promote it to mandatory scope.

### 6. Make owner decisions explicit: The station steward owns sensor identity and clock-quality declarations; the archive maintainer owns replay and backfill policy. The club editor chooses freshness wording without implying live measurements.

Owner authority is reserved as follows: The station steward owns sensor identity and clock-quality declarations; the archive maintainer owns replay and backfill policy. The club editor chooses freshness wording without implying live measurements. The draft has not obtained these decisions. Its tentative implementation assumptions cannot substitute for them.

### 7. Preserve negative constraints: Do not connect to live stations, modify gateways, assert guaranteed exactly-once observation delivery, discard raw readings merely because they arrive late, or provide weather-safety advice.

Binding exclusions: Do not connect to live stations, modify gateways, assert guaranteed exactly-once observation delivery, discard raw readings merely because they arrive late, or provide weather-safety advice. The draft has no complete trace showing that its assumptions comply; revise the proposal wherever necessary to preserve these exclusions.

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
