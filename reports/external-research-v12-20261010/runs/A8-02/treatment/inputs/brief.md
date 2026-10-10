# Delayed community weather-station observations

## Assignment

A volunteer weather club aggregates temperature and rainfall observations from ten stations. Some use a low-power radio gateway; others upload CSV after an outage. The club publishes a historical chart with an explicit freshness indicator and preserves raw observations for correction. Devices may reboot or buffer readings for hours. The system is informational and must never control equipment or issue hazard warnings.

You have a 60-minute whole-topic research envelope. Produce a planning proposal, not an implementation. Use public primary documentation, relevant public source code and released issue/fix history where they bear on the proposal. Discover realistic products, mechanisms and alternatives independently; no product, source or conclusion is preselected. A bounded historical example and useful unfamiliar opportunities matter more than an exhaustive catalogue. Clearly distinguish observed external behavior, your inference and a local product choice.

## Exact numbered obligations

1. Compare two ingestion/archive routes and an analogous delayed-event processing mechanism, including low-power and CSV tradeoffs.
2. Explain observation time versus arrival time, duplicate/replayed messages, rebooted sequence counters and correction lineage.
3. Research the boundary between radio/network delivery behavior, application replay policy and historical-chart interpretation.
4. Investigate a relevant released ingestion/time-ordering failure or fix chain and identify what remains dependent on the club’s actual devices.
5. Preserve and investigate this supported optional scope: a documented CSV backfill path with staff-reviewed duplicate and correction handling. It is an authorized option, not a mandatory feature or an established technical capability; recommend conditions, retain it when supported, and explain any evidence-based exclusion.
6. Make owner decisions explicit: The station steward owns sensor identity and clock-quality declarations; the archive maintainer owns replay and backfill policy. The club editor chooses freshness wording without implying live measurements.
7. Preserve negative constraints: Do not connect to live stations, modify gateways, assert guaranteed exactly-once observation delivery, discard raw readings merely because they arrive late, or provide weather-safety advice.
8. Deliver one coherent evidence-backed research proposal covering obligations 1–8, with recommendations, source/version applicability, useful discoveries, unresolved owner inputs, and a validation table separating checks actually executed from checks merely proposed. Do not report research sources or future tests as executed product validation.

## Research boundaries and deliverable

Keep the investigation at the pilot scale above. No installs, accounts, production access, purchases or live writes are needed. Read-only public retrieval is appropriate; any permitted local discriminating check must be disclosed with its actual inputs and result. A check you did not run remains proposed or NOT_RUN. Deliver a complete proposal with a compact comparison, evidence-linked recommendations and prioritized validation; there is no requirement to build a prototype. Owner inputs may remain explicit decisions, but they do not excuse investigating publicly answerable questions. This brief is the complete discovery input.
