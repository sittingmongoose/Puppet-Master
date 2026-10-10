# Research proposal: small ferry service disruption board

## Decision summary

For a one-route, two-terminal seasonal pilot, evaluate a thin server-side GTFS adapter and purpose-built public/kiosk board first. Keep the scheduled timetable useful on its own. Add producer realtime only when the operator and regional partner confirm the exact feed versions, identifiers, message types, freshness, and outage behavior. If realtime is missing, stale, or known to describe a different timetable, show the approved schedule and explicitly say realtime is unavailable; do not manufacture an ETA or leave an old message displayed as current.

OpenTripPlanner 2.10.0 is a credible alternate ingestion/API route if a maintained OTP service exists or future network-wide planning is valuable. It is not selected. Its GTFS GraphQL API supports generic transit data queries; its distinct runtime alert and trip updaters, graph build, configuration and monitoring add cost for a board limited to two terminals. The released version exposes a GTFS feed version through its API, and its polling graph-update wait is on by default in the versioned code unless configuration overrides it. These facts improve its candidacy but do not validate the pilot feed or operation. [S08, S09, S16, S17, S18]

If the partner already publishes NeTEx and a named SIRI profile, assess NeTEx plus SIRI-ET and SIRI-SX as a separate schedule-plus-realtime option. Do not assume it is available or equivalent to GTFS. [S14, S15]

## Product proposal and operating rules

### 1. Build a stable scheduled board

For each terminal, map its confirmed stop_id to the published route and trips. Resolve trips against the exact approved schedule dataset, active service_id calendar/calendar_dates rules, service date, agency timezone and stop sequence. Retain the schedule zip hash, publisher feed_version if present, effective dates and local import time. Use feed stop order and an owner-approved terminal mapping for direction; do not infer rider-facing direction names from a generic route label. GTFS IDs are internal join keys, not display names. [S01]

GTFS service day is not necessarily the local calendar day and can run beyond 24:00:00; stop_times is in agency.agency_timezone, not stop.stop_timezone. calendar_dates may add or remove specific dates from weekly service. Consequently, a trip at 01:15 after midnight may still belong to the prior service day. This is separate from realtime matching, which may require a dated trip-instance key. [S01, S03]

### 2. Add producer realtime as a separately attributed overlay

Use only message types the regional partner confirms it actually supplies. For a scheduled trip, accept a TripUpdate only when it matches the exact trip instance and an approved schedule version. Display the published schedule time and, where a valid fresh producer time exists, a clearly separate “Realtime update” time/status. GTFS-RT event times can be producer estimates; without partner semantics do not label one an observed vessel position or a guaranteed ETA. [S02, S03]

An absent TripUpdate means realtime is unavailable; it is not an on-time assertion. NO_DATA also supplies no realtime time. Cancellation or skipped-stop status is explicit status data; an ADDED/NEW or unscheduled trip must be shown as such only if that message type is supported, relevant at the terminal, and reconciled with the partner's versioned feed. Never derive a new time from a blank prediction or a stale time. [S02, S03, S07]

Treat GTFS Service Alerts separately. Match their active time range and informed entities to the board's terminal/route/trip scope, then render alert text in a disruption area. Individual trip delay/cancellation should usually be carried by TripUpdate. Do not convert route/terminal alert prose into a particular trip's time or status. If an alert has no active_period, GTFS permits it to remain visible while present in the feed, so the consumer still needs feed freshness and removal handling. [S02, S04, S05]

### 3. Make version and freshness visible in the data path

GTFS Realtime's gtfs_realtime_version field identifies protocol version 2.0; it does not identify the schedule dataset. The optional Realtime feed_version is the schedule version it was based on and is intended to match static feed_info.feed_version. MobilityData recommends publishing matching values and consistent referenced identifiers. Because both publisher behavior and the Realtime field may be absent, absence does not prove alignment. [S02, S06, S07]

Product policy proposal:

- Keep each immutable static timetable release and its exact source/version in the importer.
- If a nonempty realtime feed_version differs from the approved static feed_info.feed_version, do not apply schedule-linked TripUpdates or alerts to the new schedule. Keep scheduled departures and show realtime as unavailable due to a version mismatch.
- If the schedule side or realtime side omits a usable version, require an explicit publisher/partner binding for the exact feed pair before treating identifiers as verified. Do not silently match a new revision solely because old trip_id values still exist.
- For all accepted entities, preserve the response/header timestamp and any TripUpdate/entity timestamp. A newly refreshed FeedHeader does not make old event data fresh.
- Use GTFS Realtime best-practice ages as initial acceptance candidates: TripUpdates within 90 seconds, Alerts within 10 minutes, with a producer refresh recommendation of 30 seconds. These are recommendations, not mandatory protocol rules or verified partner performance. The operator and duty manager must approve thresholds, labels, and what the public sees when a limit is crossed. [S05]

When data falls outside the approved threshold, retain the timetable and mark realtime stale/unavailable with last-checked time where available. Avoid wording such as “on time” unless the partner has supplied a matching update that supports that statement. If feed version is known to be mismatched, quarantine all schedule-linked realtime entities; only show any broader notice if its scope is unambiguous and the partner confirms it remains applicable.

### 4. Keep staff advisories separate from feed observations

Retain the staff-authored banner as supported optional scope, not a mandatory feature. A proposed notice record should have separate provenance and fields for author/approver, text, affected terminal/route, published time, effective start and end, state, and retraction. Label it plainly “Staff advisory.” Do not write it into the partner feed, pass it off as a realtime observation, or let a manual message silently alter a TripUpdate or schedule row.

The banner can help when machine-readable disruption information is absent, stale, or mismatched if the duty manager approves and there is a reliable publish, expiry, edit, audit and retract path. If that workflow is not supportable for launch, preserve it as an owner-authorized optional path and show the agreed schedule/realtime unavailable wording; do not imply that the brief or a GTFS/SIRI specification supplies an authoring tool. When feed alerts and staff notices coexist, keep attribution and scope distinct. Any contradiction requires duty-manager resolution rather than automatic precedence.

### 5. Compare the routes and alternative

| Route | Evidence-backed fit | Tradeoffs for this pilot | Recommendation |
| --- | --- | --- | --- |
| Direct GTFS/GTFS-RT adapter with a custom board | GTFS is a schedule plus realtime standard intended for passenger information and used beyond trip planners. A small adapter can join only the two terminal stops and one route. [S01-S07] | The team owns parsing, versioning, freshness, message applicability, observability and all public wording. The partner's exact protocol/feeds and data quality are unknown. | Evaluate first for pilot scale, conditional on correct static export and partner feed contracts. |
| OpenTripPlanner 2.10.0 behind a custom board | GTFS GraphQL is documented as a general-purpose API; runtime Alert and TripUpdate pollers are supported. 2.10.0 exposes GTFS feed version in GraphQL and enables poll-wait behavior by default in its source feature configuration. [S08-S10, S16-S18] | It remains a server to configure and operate, and a custom board still needs to separate schedule, realtime, alerts and manual notices. Feed transformations and real update load require direct validation. The lag issue/fix history makes exact configuration and workload tests important. [S11-S13] | Keep as an alternate where the service already exists or broader planning capability justifies it. Pin a release and confirm its feature configuration. |
| NeTEx schedule plus SIRI-ET/SIRI-SX | OTP's example separates ET predicted journey times from SX disruption messages, using Transmodel references to NeTEx. SIRI v2.2 is a stable schema branch. [S14, S15] | Requires actual partner support, schema release, national profile, identifiers and timetable linkage. The Norwegian example does not prove local ferry support. | Investigate only if partner says this is its real source. Do not convert a schedule or alert from one model to the other by assumption. |

### 6. Released issue/fix history and precise scope

OpenTripPlanner issue #6252 reports realtime lag up to 20 minutes under load in OTP 2.7.0-SNAPSHOT, using National Rail GTFS plus GTFS-RT. The issue's example had alert polling at one minute and TripUpdates at 27 seconds, along with vehicle-position pollers. The reporter described graph application as asynchronous: a fetcher could start another poll while the earlier result was still queued, allowing older updates to accumulate. The issue did not identify a feed_info.feed_version, static zip hash, or timetable revision, so it is not evidence that a specific timetable revision caused the lag. [S11]

PR #6262 was merged into dev-2.x on 2025-01-09 and is listed in the OTP 2.7.0 release dated 2025-03-12. The PR changed polling updater behavior to wait for graph update completion. The diff shows PollingGraphUpdater waiting for the submitted future when WaitForGraphUpdateInPollingUpdaters is enabled; source code at the v2.10.0 tag sets that feature enabled by default, but deployment configuration can turn it off. The changed updater set includes realtime alerts, SIRI, trip and other pollers. The covered operation is polling result application/backpressure, across schedule data sources; no particular timetable revision is named. The PR conversation's test summary says no unit tests, while its changed files include PollingGraphUpdaterTest; no performance/load test is documented. This chain supports a release/config/load check, not a claim of zero lag for this ferry board. [S12, S13, S16, S18]

Separately, the GTFS-RT revision history added optional FeedHeader.feed_version in December 2024 to identify the static Schedule version. It deprecated schedule_relationship ADDED in favor of NEW and added REPLACEMENT in May 2025, and added communication_period/impact_period to Service Alerts in June 2026. These changes make protocol version, message-type support, and optional-field support material to the partner contract. [S02, S07]

## Exact clause dispositions against revealed plan

The plan source is the released copy only: revealed-plan.md. The assigned helper reported reveal at 2026-10-10T04:05:41.202Z, with discovery SHA-256 2528c9e269ab744712570a20287d85abd1214a128a8fce3d720fa7f1f839a1b4 and released-plan SHA-256 8656d21b801ae5c4905cb19f08fb8b9262058c9916bbc257537bd35353e55d97. The discovery remains frozen; source records S16-S18 were supplemental post-freeze reading.

### Clause 1 — “Compare two realistic display/ingestion routes and an analogous schedule-plus-event-stream mechanism.”

**Plan treatment:** It directs matching every realtime message by trip_id alone and keeping the last received message visible until another arrives.

**Disposition: CORRECTION REQUIRED.** Compare a direct server-side GTFS adapter/custom board with OTP 2.10.0 as an alternate; keep SIRI/NeTEx as a conditional analogue. Do not use trip_id alone in all cases and do not hold a message indefinitely. Resolve trip instances, schedule versions, entity scope and data age; stale or mismatched data must stop being represented as current. [S01-S09, S14-S18]

### Clause 2 — “Explain static trip/service identity, realtime message types, freshness and mismatch behavior without inventing predicted departures.”

**Plan treatment:** Names OTP first and lightweight custom display second, but provides no valid matching, freshness or mismatch rule.

**Disposition: CORRECTION REQUIRED.** For GTFS, trip_id identifies a trip in a schedule file, service_id says when service operates, and trip instance matching may additionally need service date and start time. Keep gtfs_realtime_version separate from static feed_version. Treat a missing update as unavailable, not on time. Use only a fresh matching TripUpdate for a distinct realtime status/time. The optional version-link field does not prove mismatch behavior by itself; the fail-closed fallback here is a local product choice. [S01-S07]

### Clause 3 — “Investigate related identifier, service-day/time-zone and alert-applicability conditions together, while preserving their distinct semantics.”

**Plan treatment:** It treats all disruptions as delays, assumes times fit within a calendar day, and defers service-day/timezone/alert scope.

**Disposition: CORRECTION REQUIRED.** Keep four questions separate and jointly validated: (1) which static route/trip/stop IDs the export assigns; (2) whether service_id is active on the GTFS service date under calendar/calendar_dates; (3) how agency_timezone and greater-than-24:00 times map that service date to displayed time; and (4) whether an Alert's active period and informed entities include this route, terminal or trip. A TripDescriptor may require trip_id + start_date + start_time; that does not turn service_id or an Alert selector into a trip identity. [S01-S04]

### Clause 4 — “Trace a relevant released feed/consumer change or failure/fix chain, identifying the operations and timetable revisions it governs.”

**Plan treatment:** It attaches no consumer history and leaves notice precedence unspecified.

**Disposition: CORRECTION REQUIRED.** Record the OTP #6252 → PR #6262 → OTP 2.7.0 chain and the follow-up source behavior in 2.10.0. It concerns polling completion/backpressure and identifies no exact GTFS timetable version. State that limit explicitly. Separately record the Realtime feed_version field's December 2024 addition as the version-pairing change; it is optional. Proposed validation must exercise the specific schedule zip/version with the partner feed and OTP version/config. [S02, S06, S07, S11-S13, S16-S18]

### Clause 5 — “Preserve and investigate this supported optional scope: a staff-authored advisory banner when machine-readable disruption data is unavailable. It is an authorized option, not a mandatory feature or an established technical capability; recommend conditions, retain it when supported, and explain any evidence-based exclusion.”

**Plan treatment:** This is correct that permission is not technical support and that the banner is optional.

**Disposition: RETAIN OPTIONAL SCOPE; ADD OPERATING CONDITIONS.** Keep the option. Recommend it only with a duty-manager-owned publish/approve/expiry/retract process, route/terminal scope, an unmistakable Staff advisory label, and audit/provenance kept separate from GTFS-RT. There is no evidence-based reason to exclude the option, and there is no evidence that a current CMS or manual-feed tool exists. If technical support cannot be confirmed, state the workflow as an open owner decision rather than promise it for pilot launch. [Brief; local product recommendation]

### Clause 6 — “Make owner decisions explicit: The schedule publisher owns timetable versions; the duty manager owns manual advisories and stale-data wording. The regional partner must confirm which realtime messages it actually supplies.”

**Plan treatment:** The owner boundaries are correct; the decisions remain unmade.

**Disposition: OWNER INPUT REQUIRED; PRESERVE AUTHORITIES.** Do not choose a schedule version for the publisher, notice content/wording for the duty manager, or realtime message coverage for the partner. Request the input package below. Owner uncertainty does not excuse unresolved public facts that the standards and released history answer.

### Clause 7 — “Preserve negative constraints: Do not dispatch vessels, infer an ETA from missing data, treat service alerts as trip updates, or present a manual advisory as a realtime feed observation.”

**Plan treatment:** It correctly marks these as binding exclusions but gives no implementation trace.

**Disposition: RETAIN AS BINDING CONSTRAINTS.** The proposal is display-only. It shows schedule time when realtime is absent; it never derives an ETA from absence, a stale value or an alert. Alerts occupy their own disruption surface. Staff notices have distinct provenance and authorship. [S02-S05; brief]

### Clause 8 — “Deliver one coherent evidence-backed research proposal covering obligations 1–8, with recommendations, source/version applicability, useful discoveries, unresolved owner inputs, and a validation table separating checks actually executed from checks merely proposed. Do not report research sources or future tests as executed product validation.”

**Plan treatment:** It says no coherent final proposal exists, and has documentation/version review and product comparison marked NOT_RUN.

**Disposition: COMPLETED AS A RESEARCH PROPOSAL; NO PRODUCT VALIDATION CLAIMED.** This draft provides recommendations, source and version scope, alternatives, conditions, preserved optional scope, owner inputs and separate validation status. Read-only public documentation, source code, and released issue history were inspected during this stage. That is research; no ferry timetable or realtime feed was supplied, and no product behavior was tested. Update the handoff statuses below accordingly.

## Owner input packet

1. **Schedule publisher:** exact GTFS zip and source URL; feed_info.feed_version and effective dates; route_id, both terminal stop_ids, trip_id/service_id and stop order; agency_timezone; calendar/calendar_dates exceptions; publication cadence, approval and rollback/version-overlap rules.
2. **Regional partner:** exact endpoint(s), access conditions, supported GTFS-RT protocol version, actual entity types (TripUpdates, Alerts, VehiclePositions, Trip Modifications if any), timestamps and typical/maximum cadence; whether Header.feed_version is populated and which exact static revision it references; identifier mapping and change behavior; alert active-period/entity-scope practice; outage and stale-data behavior.
3. **Duty manager:** approved stale/unavailable wording; advisory authorization, affected scope, author/approval path, effective/expiry rules, correction and withdrawal process, whether a reliable publishing tool exists, and how an advisory can coexist with or be withdrawn when machine data changes.
4. **Product owner:** public board channels and language/accessibility needs, initial freshness thresholds, what stale/mismatch status is shown, whether source/update timestamps are public, and whether the optional staff notice is included in pilot launch.

## Optional improvements and future gates

- Keep SIRI/NeTEx in the option set only when the partner already provides a documented profile; do not build a second-standard adapter speculatively.
- If a partner notice lacks actionable route/trip IDs but has confirmed network scope, a human-readable alert may still be useful; show its source, scope and effective period without synthesizing a trip estimate.
- Once the schedule publisher approves version handling, expose an internal operations record of imported schedule version and realtime version/age. Public display of these raw values is a separate design decision.
- The optional staff banner may be deferred from first launch if its support workflow is unavailable; retain the authorized option and do not describe the deferred manual workflow as machine-readable service.

## Validation table

| Check | Status | Evidence / next action |
| --- | --- | --- |
| Read public GTFS/OTP/SIRI specifications and docs | EXECUTED — research only | S01-S10, S14-S18. This confirms external documented behavior, not pilot behavior. |
| Inspect released consumer failure/fix history and relevant code | EXECUTED — research only | OTP issue #6252, PR #6262, v2.7.0 and v2.10.0 sources, S11-S13, S16-S18. No specific timetable revision is named in the failure issue. |
| Review exact operator static timetable, IDs, date rules and timezone | NOT_RUN | The operator has not supplied its export. After receipt, preserve source URL, version, zip SHA-256 and inspection time. |
| Review actual regional realtime feed and supported message coverage | NOT_RUN | The partner has not supplied an endpoint/sample or message contract. No live feed was accessed. |
| Check schedule/realtime version pairing and trip-instance matching | PROPOSED — NOT_RUN | Replay the exact versioned export and partner sample for ordinary, frequency/repeated, after-midnight and late/collision cases; test explicit match, mismatch and absent feed_version. |
| Check stale, absent, NO_DATA, SKIPPED and CANCELED cases | PROPOSED — NOT_RUN | Use controlled fixtures with recorded source timestamps; confirm schedule remains and no false on-time/ETA claim appears. Compare thresholds with the duty manager's approved wording. |
| Check Alerts independently from TripUpdates | PROPOSED — NOT_RUN | Test route, terminal, trip and global scopes, active/expired periods, absent period, stale alert and retraction. Assert alerts never rewrite trip times. |
| Test OTP as alternate | PROPOSED — NOT_RUN | Pin v2.10.0; record config including WaitForGraphUpdateInPollingUpdaters, run the actual feed under representative poll/update load, inspect GraphQL feed version and resulting terminal departures, and record release plus dataset hash. |
| Exercise optional manual advisory workflow | PROPOSED — NOT_RUN | Confirm tool and duty-manager role; publish, approve, scope, expire, edit and retract; verify attribution and no feed-observation label. |
| End-to-end board deployment/operation | NOT_RUN | No build, install, account, production access, purchase, write or deployment occurred; none is claimed. |

## Source and evidence map

See sources/index.md for the navigable source index and source-map.json for full source identity, exact URL, version/release, locator, access UTC, observed operation, governing conditions/defaults/exceptions, and applicability. IDs are immutable pointers to the recorded source/version; a new release requires a new ID.
