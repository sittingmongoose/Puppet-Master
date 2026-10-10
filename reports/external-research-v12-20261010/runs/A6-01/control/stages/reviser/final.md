# Final research proposal: small ferry service disruption board

## Decision and scope

For the seasonal pilot covering one route and two terminals, evaluate a thin server-side GTFS/GTFS-Realtime adapter with a purpose-built public or kiosk board first. The timetable must remain useful by itself. Add a producer realtime overlay only after the schedule publisher and regional partner bind their exact versions, identifiers, message coverage, freshness behavior and outage handling. Show the published schedule when realtime is missing, stale or mismatched, with approved wording that says realtime is unavailable. Do not display an old event as current, infer an ETA from its absence, or imply that a prediction is a vessel position or guarantee.

OpenTripPlanner (OTP) 2.10.0 is a credible alternate ingestion/API route if the operator already runs OTP or broader network planning is valuable. It is not selected for the pilot. Keep NeTEx plus SIRI-ET/SIRI-SX as a conditional analogous schedule-and-event-stream mechanism only if the partner confirms its exact profile and version. These are planning recommendations, not implementation or deployment decisions.

This proposal answers the original brief and the released plan. It keeps external behavior, inference, local product choice and unresolved owner decisions distinct. The released plan is a fallible input, not authority. Exact source IDs below resolve through [sources/index.md](sources/index.md) and [source-map.json](source-map.json). Their URLs, release/version, locators, access UTC, observed operation, conditions and applicability are recorded there.

## Proposed board behavior

### Static schedule and trip identity

Import and retain an immutable copy of the exact approved schedule dataset, its source URL, zip SHA-256, publisher-supplied `feed_info.feed_version` if present, effective dates and local import time. For each displayed departure, resolve the published `route_id`, `trip_id`, `service_id`, stop ID and stop sequence against that dataset. The schedule publisher owns version selection, release and rollback. GTFS IDs are internal join keys, not rider-facing names. Use stop order and an owner-approved terminal mapping for direction labels. [S01]

These values answer different questions and must not be substituted for one another:

- `trip_id` identifies a scheduled trip in a dataset; `service_id` selects the operating dates.
- `calendar.txt` and `calendar_dates.txt` determine whether that service operates on a GTFS service date. Date exceptions modify the base calendar when both are used.
- Service day can differ from calendar day and can extend beyond 24:00:00. A 01:15 departure after midnight can belong to the previous service day.
- `stop_times` values use `agency.agency_timezone`, not `stops.stop_timezone`. GTFS Time is measured from “noon minus 12h” of the service day, effectively midnight except on daylight-saving transition days. The parser and displayed time therefore need a transition-day test against the exact feed and timezone; ordinary local midnight plus elapsed seconds is not a safe unstated assumption. [S01]
- Inspect `frequencies.txt` and `exact_times`. With `exact_times=0`, service is headway-based and does not follow fixed departures throughout the day. Do not turn its representative/template trip into an exact scheduled departure. If present, show a publisher-approved headway/window representation or defer its public representation for an owner decision. With `exact_times=1`, it is a compressed schedule-based service; resolve the generated departure sequence according to the file's start, end and headway rules. No actual ferry export was supplied, so neither frequency case is known to apply. [S01]

The static-feed review must jointly inspect IDs, operating dates, agency timezone, extended-hour trips, daylight-saving transitions, frequency records and the two-terminal stop mapping. Those remain distinct inputs to display logic, not one generic “date/time” rule.

### Realtime overlay, matching, freshness and mismatch

Keep the protocol version separate from the timetable revision. GTFS-RT `gtfs_realtime_version` identifies the realtime protocol; optional `FeedHeader.feed_version` identifies the static schedule version the realtime feed describes and is intended to match `feed_info.feed_version`. MobilityData recommends aligned IDs and publication of both version values, but this is guidance, not consumer enforcement. The optional realtime value's absence does not prove the feeds align. [S02, S06, S07]

Resolve each TripUpdate to exactly one trip instance in the exact approved schedule:

- For ordinary scheduled trips, `trip_id` is often enough; a long trip or a delay that collides with the next service day's trip can require `start_date`.
- Frequency-based trip instances require `trip_id`, `start_date` and `start_time`. A `start_time` used to identify a frequency trip is the initially scheduled instance key and remains immutable when the prediction changes; the change belongs in StopTimeUpdate.
- The specification permits a fallback combination of `route_id`, `direction_id`, `start_time` and `start_date` only if it resolves uniquely. If a descriptor resolves to zero or multiple instances, reject or quarantine that entity and report realtime unavailable for it. [S02, S03]

Show published time as **Scheduled**. Show a separate, clearly attributed **Realtime update** only for a fresh, valid, instance-matched producer update bound to the approved schedule. A missing TripUpdate means realtime is unavailable, not that the ferry is on time. `NO_DATA` also carries no realtime timing. Cancellation and skipped-stop states are explicit statuses; they are not replacement departure times. A blank, stale or invalid prediction never generates an ETA. Any producer estimate remains an estimate and must not be labeled an observed vessel position or guaranteed arrival without partner semantics. [S02, S03]

Support only message relationships the partner confirms and the chosen parser/version handles. The current reference distinguishes:

- `SCHEDULED`: a trip associated with its GTFS schedule.
- `UNSCHEDULED`: for frequency-based `frequencies.txt` trips with `exact_times=0`, not an unscheduled ferry invented outside that model.
- `CANCELED`: a scheduled trip removed from service.
- `NEW`: an unrelated added trip with its full stop/time journey specified.
- `DUPLICATED`: a copy of an existing scheduled trip at a different service date/time, identified through TripProperties trip_id/start_date/start_time; it does not cancel the original, which would need its own cancellation.
- `REPLACEMENT`: a complete alternate journey replacing a scheduled trip; the original static schedule is not used for that instance. It is not a vehicle's predicted deviation from the original scheduled journey.
- `DELETED`: remove a trip from rider-facing display rather than show it as cancelled.
- `ADDED` is deprecated because its behavior was unspecified; the current reference distinguishes `DUPLICATED` from `NEW`. Some current relationships are marked experimental and subject to change. Confirm the partner's actual relationship inventory and avoid treating support in a generic example as a partner capability. [S02, S03, S07]

If explicit nonempty realtime `feed_version` differs from the approved static `feed_info.feed_version`, the proposed local policy is fail-closed: keep the approved schedule and do not apply schedule-linked realtime events to it. Mark realtime unavailable due to mismatch. If either version is absent, require an explicit publisher/partner binding for this exact pair before treating identifier alignment as verified; do not infer alignment merely because IDs look familiar. The standard does not prescribe this user-interface policy; it is a proposed product choice. If a broader alert may remain applicable despite a mismatch, show it only when the partner confirms the binding and its scope is unambiguous. [S02, S06, S07]

Retain the feed URL, publisher version, local retrieval time, header timestamp, entity/update timestamp when present, schedule version binding and validation state. Assess entity age, not just a refreshed header. GTFS-RT best practices recommend producers refresh at least every 30 seconds or on relevant change, keep TripUpdate/VehiclePosition data no older than 90 seconds, and Alert data no older than 10 minutes. These are producer recommendations, not mandatory consumer limits or evidence that this partner meets them. The duty manager and product owner must approve actual acceptance thresholds and public stale/unavailable wording. Once an approved limit is exceeded, keep the timetable and mark realtime stale/unavailable, optionally showing last-checked time. [S05]

### Alerts and their separate scope

Treat Service Alerts as their own disruption surface. Match active periods and informed entities to a route, terminal, stop or uniquely matched trip as the selectors specify. A selector's supplied fields are combined with AND; separate selectors can cover separate scopes. Do not use `TripDescriptor.route_id` as a route-wide Alert selector where `EntitySelector.route_id` is intended. If `active_period` is absent, the specification allows the alert to remain displayable while present in the feed, so freshness and removal handling are still required. Individual trip delays and cancellations should usually use TripUpdates. Never convert alert prose into a per-trip time, delay or cancellation. The June 2026 additions `communication_period` and `impact_period` distinguish when a notice is communicated from the period service is affected; whether the partner supplies these optional fields is unknown. [S02, S04, S05, S07]

### Optional staff-authored advisory

Retain the staff banner as owner-authorized **optional** scope. It is neither a mandatory feature nor evidence that a CMS/manual-feed tool exists. If supported for launch, make it a distinct editorial record with author and approver, text, affected terminal/route, publication time, effective start/end, state, expiry, audit history and a reliable correction/retraction path. Label it unmistakably **Staff advisory**. It must not enter the partner feed, masquerade as a realtime observation or silently mutate a TripUpdate or timetable row.

It may help when machine-readable disruption data is absent, stale or mismatched only if the duty manager approves the workflow and its notice remains scoped and attributable. Keep it separate when alerts coexist; resolve contradictions through the duty manager rather than an automatic precedence rule. If the workflow is not supportable for launch, record deferral as an owner decision, preserve the authorized option and show the agreed schedule/realtime-unavailable wording. No evidence-based exclusion was found. [Brief; product proposal]

## Route comparison and analogous mechanism

| Route | Evidence and fit | Pilot tradeoffs | Recommendation |
|---|---|---|---|
| Direct server-side GTFS/GTFS-RT adapter and custom board | GTFS provides schedule and realtime data suitable for passenger information. A purpose-fit adapter can resolve one route and two terminal stops, and keep schedule, update, alert and staff notice separate. [S01–S07] | The team owns parsing, version handoff, time/date joins, frequency behavior, freshness, alert applicability, monitoring and public wording. Actual partner endpoints, IDs, message types and quality are unknown. | Evaluate first for this narrow pilot after the exact static export and partner contract are confirmed. Preserve a useful schedule-only mode. |
| OTP 2.10.0 behind a custom board | OTP documents a general-purpose GTFS GraphQL API and separate runtime Alert and TripUpdate updaters. Release 2.10.0 is dated 2026-09-09; its changelog records GTFS feed-version exposure through GraphQL and a service-date grouping fix. Its exact v2.10.0 source enables polling-updater wait by default, subject to configuration override. [S08–S10, S16–S18] | A graph build, service, feed mapping, updater configuration and monitoring add operational parts for two terminals. Its transformed output still needs exact-feed verification and the custom UI must preserve all display rules. History is useful operational evidence, not proof that a pilot behaves correctly. | Keep as an alternative where OTP already exists or broader network planning justifies it. Pin the release and inspect its configuration; test the exact feed and polling load before selecting it. |
| NeTEx schedule with SIRI-ET/SIRI-SX | OTP's Norwegian tutorial example builds a NeTEx graph and configures SIRI-ET journey-time and SIRI-SX situation-message updaters separately, using Transmodel references. [S14] | This is an analogy, not evidence of partner availability or ferry compatibility. The SIRI repository observed 2026-10-10 identifies v2.3 as the latest schema branch with functional improvements and v2.2 as the latest branch matching CEN documentation with bug fixes only. Its releases table lists v2.2.1 and v2.3 releases in October 2026; use an actual release tag when matching a published CEN document. National profiles and partner binding still govern compatibility. [S15] | Investigate only if the partner supplies a named NeTEx/SIRI profile and release. Do not select a branch or translate semantics by assumption. |

## Relevant released failure/fix chain

OTP issue #6252 reported up to 20 minutes of realtime lag under load on OTP 2.7.0-SNAPSHOT using National Rail GTFS and GTFS-RT. Its sample configuration polled Alerts each minute and TripUpdates every 27 seconds (with other pollers). The issue attributed the accumulation to a new poll starting before the prior asynchronous graph application finished. It supplies no exact static zip hash, `feed_info.feed_version`, commit or timetable revision; the report is about polling/update processing, not a particular schedule version. [S11]

PR #6262, merged into `dev-2.x` on 2025-01-09, changed polling updater completion to wait for graph update completion and appeared in the OTP 2.7.0 release dated 2025-03-12. The changed operation is polling result application/backpressure across polling updaters; it does not bind those results to a particular timetable revision. In OTP v2.10.0, `WaitForGraphUpdateInPollingUpdaters` is enabled by default in source but can be changed by deployment configuration. [S12, S13, S16, S18]

The PR description's “Unit tests: None” refers to its summary. The merged commit `69ac485` adds two narrow feature-flag unit test methods: with the flag on, an asynchronous graph-writer callback completes before the updater returns; with it off, the updater returns before that callback completes. This does not document a performance/load test, feed integration test or ferry-feed test, and this research did not run those test methods. Therefore the chain justifies version/configuration review and pilot-load validation, not a zero-lag claim. [S12, S18, S19]

Separately, GTFS-RT added optional Header `feed_version` in December 2024 as a static-feed pairing signal; it is still optional. The May 2025 relationship changes deprecate `ADDED` and define `NEW`, `DUPLICATED` and `REPLACEMENT`; the June 2026 alert changes add communication and impact periods. These changes make the partner's exact protocol/version and supported message inventory material. They are distinct from the OTP polling fix. [S02, S07]

## Released-plan and critique dispositions

The plan used here is the released copy [revealed-plan.md from the investigator stage](../investigator/revealed-plan.md), whose recorded digest is `8656d21b801ae5c4905cb19f08fb8b9262058c9916bbc257537bd35353e55d97`. The frozen discovery digest is `2528c9e269ab744712570a20287d85abd1214a128a8fce3d720fa7f1f839a1b4`. The released plan is treated as a fallible proposal, not an assessor key.

The following are the brief's exact eight obligation clauses, each with its disposition against the plan's treatment:

1. **“Compare two realistic display/ingestion routes and an analogous schedule-plus-event-stream mechanism.”** The plan's trip-ID-only join and indefinite last-message display are rejected. Compare the direct adapter and OTP, with NeTEx/SIRI conditional on partner support. Resolve exact trip instance, version, entity scope and age; do not leave expired data looking current. **Disposition: CORRECTED.** [S01–S10, S14–S18]
2. **“Explain static trip/service identity, realtime message types, freshness and mismatch behavior without inventing predicted departures.”** The plan omits valid matching and mismatch handling. Distinguish trip from service date and trip instance, protocol version from schedule version, no update from on-time status, and fresh prediction from schedule. Apply the proposed fail-closed mismatch policy as a local choice, not a GTFS mandate. **Disposition: CORRECTED.** [S01–S07]
3. **“Investigate related identifier, service-day/time-zone and alert-applicability conditions together, while preserving their distinct semantics.”** The plan's calendar-day assumption and “all disruptions as delays” treatment are rejected. Jointly check static IDs, service calendars/date exceptions, agency timezone and DST/time semantics, frequency representation, and Alert time/scope selectors while preserving their separate meanings. **Disposition: CORRECTED AND EXPANDED.** [S01–S04]
4. **“Trace a relevant released feed/consumer change or failure/fix chain, identifying the operations and timetable revisions it governs.”** The plan's missing history is corrected with #6252 → #6262 → OTP 2.7.0 and the v2.10.0 feature configuration, while explicitly stating that the issue names no exact timetable revision. The optional GTFS-RT feed-version signal is a separate schedule-alignment development. **Disposition: CORRECTED.** [S02, S06, S07, S11–S13, S16–S19]
5. **“Preserve and investigate this supported optional scope: a staff-authored advisory banner when machine-readable disruption data is unavailable. It is an authorized option, not a mandatory feature or an established technical capability; recommend conditions, retain it when supported, and explain any evidence-based exclusion.”** The plan correctly states that permission does not establish technical support. Retain the option with duty-manager workflow, scope, attribution, expiry, audit and retraction conditions. No evidence-based exclusion or existing-tool claim is made. **Disposition: RETAIN OPTIONAL SCOPE; CONDITION ITS USE.** [Brief; product proposal]
6. **“Make owner decisions explicit: The schedule publisher owns timetable versions; the duty manager owns manual advisories and stale-data wording. The regional partner must confirm which realtime messages it actually supplies.”** Preserve these decision rights. The proposal does not choose the schedule revision, public wording or partner coverage. **Disposition: OWNER INPUT REQUIRED; AUTHORITIES RETAINED.**
7. **“Preserve negative constraints: Do not dispatch vessels, infer an ETA from missing data, treat service alerts as trip updates, or present a manual advisory as a realtime feed observation.”** The board remains display-only. A missing/stale prediction yields no ETA; alerts remain separate; staff notices retain provenance. **Disposition: RETAINED AS BINDING CONSTRAINTS.** [S02–S05; brief]
8. **“Deliver one coherent evidence-backed research proposal covering obligations 1–8, with recommendations, source/version applicability, useful discoveries, unresolved owner inputs, and a validation table separating checks actually executed from checks merely proposed. Do not report research sources or future tests as executed product validation.”** This document consolidates recommendations, alternatives, evidence, owner inputs and explicit check status. Read-only primary-source retrieval and source-code/release inspection are research; they are not product validation. **Disposition: COMPLETED AS A RESEARCH PROPOSAL; NO PRODUCT VALIDATION CLAIMED.**

### Independent critique issue register

Each critique is adjudicated on evidence rather than reviewer authority:

- **C-01, static frequency service:** **Accept.** The draft did not say what to display for `exact_times=0` headway service. Inspect `frequencies.txt`; do not invent individual departure times from a headway/template. Preserve a headway representation or other display choice as an owner/product decision. `exact_times=1` is compressed schedule-based service, not the same condition. No ferry feed was provided, so applicability is unknown. [S01; direct recheck in source map]
- **C-02, daylight-saving transition:** **Accept.** GTFS Time is measured from service-day “noon minus 12h”, effectively midnight except on DST-transition days. Add spring/fall transition cases for the exact export/timezone to proposed validation. Do not claim this was tested or impose a ferry-specific clock rule without the data. [S01; direct recheck in source map]
- **C-03, SIRI version distinction:** **Accept and amend.** The current repository table observed on 2026-10-10 separates v2.3 (latest XML-schema branch with functional improvements) from v2.2 (latest branch matching CEN documentation, bug fixes only). The releases table lists v2.2.1 and v2.3 releases in October 2026. Use a release for a schema matching a published CEN document; ask for the partner's national profile and exact release. This corrects the draft's incomplete “v2.2 stable branch” wording without selecting a partner version. [S15; direct recheck in source map]
- **C-04, GTFS-RT trip relationships:** **Accept and expand.** Add conditional handling/validation inventory for `UNSCHEDULED` only with frequency `exact_times=0`, `DUPLICATED`, `NEW`, `REPLACEMENT` and `DELETED`, with `ADDED` deprecated and relationship-specific semantics. Run only cases actually supported by the partner; no such feed was available. [S02, S03, S07; direct recheck in source map]
- **C-05, OTP test wording:** **Accept and clarify.** The PR summary says no unit tests; commit 69ac485 in its merged changes adds two narrow feature-on/off async graph-writer tests. This reconciles the records. They are not load, integration or ferry tests, and were not executed here. [S12, S18, S19; direct recheck in source map]

## Owner input packet

1. **Schedule publisher:** exact GTFS zip/source URL and SHA-256; `feed_info.feed_version`, effective dates and expiry; route and both terminal stop IDs; trip/service IDs, stop order, timezone, calendar exceptions, `frequencies.txt` and `exact_times`; time-change behavior; release approval, overlap and rollback policy.
2. **Regional partner:** exact endpoint and access terms; GTFS-RT protocol version and actual TripUpdate/Alert/VehiclePosition/Trip Modification and relationship coverage; update cadence and timestamps; whether Header `feed_version` is present and which exact static release it references; identifier mapping and revision-change behavior; Alert selectors/periods; outages and stale behavior. If SIRI/NeTEx is supplied instead or additionally, provide exact schema release and national profile.
3. **Duty manager:** approved stale/unavailable wording and thresholds; notice author/approver, scope, start/end/expiry, correction, audit and retract process; whether a reliable tool exists and whether the option is included at launch; how contradictory notices are resolved.
4. **Product owner:** public channels, language and accessibility needs; visibility of source/update times; final stale/mismatch states; any decision to represent headway-based service; pilot choice of direct adapter versus existing OTP route.

## Validation and evidence status

| Check | Status | Evidence or next action |
|---|---|---|
| Read public GTFS, OTP and SIRI primary documentation | **EXECUTED — research only** | Spec references, product documentation, source code and release history are recorded as S01–S19. Direct reviser rechecks of the disputed Schedule, Realtime, SIRI, OTP PR and test claims are separately recorded in source-map.json. |
| Inspect OTP #6252 / #6262 / OTP 2.7.0 / v2.10.0 behavior and test scope | **EXECUTED — research only** | Issue/release/source inspection; no exact timetable revision is identified. The two added unit test methods were read, not run. No load/performance result is claimed. |
| Inspect the exact operator static timetable, calendar, IDs, timezone, DST and frequency records | **NOT_RUN** | No operator export was supplied. On receipt, record source/version/hash and cover calendar exceptions, >24:00 times, DST transitions, `exact_times=0` headway and `exact_times=1` schedule cases if present. |
| Inspect actual partner realtime endpoint and message inventory | **NOT_RUN** | No endpoint, sample or partner contract was supplied or accessed. |
| Match realtime to the exact static version/trip instance | **PROPOSED — NOT_RUN** | With authorized fixtures, test matching/mismatching/omitted `feed_version`; repeated/frequency trip instances; late/next-day collisions; and all relationship types only if the partner supports them. |
| Test absent, stale, NO_DATA, skipped, cancelled and alert behavior | **PROPOSED — NOT_RUN** | Use controlled data with recorded header/entity times. Assert the schedule remains, no false on-time/ETA statement appears, Alert selectors/periods stay separate, and removed/expired items cease to appear according to policy. |
| Evaluate OTP as an alternate | **PROPOSED — NOT_RUN** | Pin v2.10.0 or a later selected release; record feature configuration, feed mapping and schedule hash; inspect GraphQL version and terminal departures; measure polling and recovery under representative actual update load. |
| Exercise staff notice workflow | **PROPOSED — NOT_RUN** | Confirm tooling and duty-manager roles; publish, approve, scope, expire, correct and retract; verify distinct attribution and audit. |
| End-to-end public board operation/deployment | **NOT_RUN** | No build, product, prototype, install, account, live write or deployment was available or performed. |

## Native Goal observation

The native Goal was created through the supported tool before substantive research. Direct activation fields returned by that tool:

- `threadId`: `01a1240e-2764-7262-9ca9-11666df4d6bf`
- `objective`: `ER12 reviser stage, run A6-01-control: execute ER12_RUNTIME/runs/A6-01/control/stages/reviser/assignment.md; preserve complete brief scope and save required outputs before completing this native Goal.`
- `status`: `active`
- `tokensUsed`: `0`
- `timeUsedSeconds`: `0`
- `createdAt`: `1791606296`
- `updatedAt`: `1791606296`
- `remainingTokens`: `null`
- `completionBudgetReport`: `null`

Provider/method provenance beyond the directly returned fields is **UNKNOWN**. These fields prove activation only. Terminal completion is reported from the separate native Goal completion result, not inferred from task completion.



Pre-completion native Goal snapshot directly returned by get_goal (after required outputs were saved):

- `threadId`: `01a1240e-2764-7262-9ca9-11666df4d6bf`
- `objective`: same exact objective shown above
- `status`: `active`
- `tokensUsed`: `168048`
- `timeUsedSeconds`: `418`
- `createdAt`: `1791606296`
- `updatedAt`: `1791606714`
- `remainingTokens`: `null`
- `completionBudgetReport`: `null`

## Native Goal terminal result

After `final.md` and `source-map.json` were saved, the supported native Goal tool returned this terminal state:

- `threadId`: `01a1240e-2764-7262-9ca9-11666df4d6bf`
- `objective`: the exact objective recorded above
- `status`: `complete`
- `tokensUsed`: `173100`
- `timeUsedSeconds`: `446`
- `createdAt`: `1791606296`
- `updatedAt`: `1791606742`
- `remainingTokens`: `null`
- `completionBudgetReport`: `Goal achieved. Report final usage from this tool result's structured goal fields. If `goal.tokenBudget` is present, include token usage from `goal.tokensUsed` and `goal.tokenBudget`. If `goal.timeUsedSeconds` is greater than 0, summarize elapsed time in a concise, human-friendly form appropriate to the response language.`
