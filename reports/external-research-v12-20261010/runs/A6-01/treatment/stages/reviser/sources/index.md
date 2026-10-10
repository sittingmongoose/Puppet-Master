# Source index — A6-01-treatment investigator

Use the stable source IDs below in discovery and the plan-facing draft. Each entry has a short evidence note and exact URL, locator, access/version metadata in ../source-map.json. Notes are bounded paraphrases of public primary-source material, not copied pages. Sources were retrieved read-only on 2026-10-10; no local feed or product validation was performed.

## GTFS neighborhoods

### [S01] Schedule identity, service day, time zone and ferry type
- URL: https://gtfs.org/documentation/schedule/reference/
- Version: reference page revised 2026-04-27.
- Locator: Dataset Publishing & General Practices; Term Definitions (service day / Time); agency.txt agency_timezone; routes.txt route_type; stop_times.txt.
- Evidence: Ferry is route_type 4. Times belong to agency timezone; service days can cross midnight and use values above 24:00; after-midnight instances remain within their service day; DST days have a special time base. Persistent feed URL and IDs are recommended across dataset iterations.
- Applicability: direct Schedule contract; actual ferry feed values absent.

### [S02] GTFS Schedule / Realtime overview
- URL: https://gtfs.org/documentation/overview/
- Version: maintained overview as accessed 2026-10-10.
- Locator: GTFS Schedule, GTFS Realtime, source-of-truth statements.
- Evidence: Schedule is a static ZIP of routes/trips/stops/stop times/calendar; Realtime covers TripUpdates, Alerts and VehiclePositions; separate detailed references define the actual requirements.
- Applicability: direct frame for static-only and enhanced pilot routes.

### [S03] GTFS Realtime reference
- URL: https://gtfs.org/documentation/realtime/reference/
- Version: specification version 2.0; the page is on mutable maintained documentation, accessed 2026-10-10.
- Locator: FeedMessage/FeedHeader; TripDescriptor fields and ScheduleRelationship.
- Evidence: Every realtime feed relates to a static GTFS; header timestamp is feed creation time; optional feed_version identifies the static feed in feed_info; trip identity requirements depend on frequency and available trip_id.
- Applicability: direct identity/revision contract.

### [S04] GTFS Realtime best practices
- URL: https://gtfs.org/documentation/realtime/realtime-best-practices/
- Version: current maintained recommendations accessed 2026-10-10.
- Locator: Feed Publishing & General Practices; TripDescriptor; TripUpdate timestamp.
- Evidence: Recommend refresh each 30 sec and event ages under 90 sec for TripUpdates/VehiclePositions and under 10 min for Alerts. These are best practices; a newly refreshed header alone cannot establish freshness of embedded records.
- Applicability: partner SLA discussion and proposed stale-state tests.

### [S05] GTFS TripUpdates
- URL: https://gtfs.org/documentation/realtime/feed-entities/trip-updates/
- Version: current maintained guidance accessed 2026-10-10.
- Locator: Trip Updates; repeated trip_ids; StopTimeUpdate default, NO_DATA, propagation.
- Evidence: No TripUpdate means no realtime data, not on-time. A delay requires a matching schedule clock; NO_DATA is unknown for that portion. Frequency trip instances use trip_id + service date + start time.
- Applicability: direct rider-facing predicted-time rules.

### [S06] GTFS Service Alerts
- URL: https://gtfs.org/documentation/realtime/feed-entities/service-alerts/
- Version: current maintained guidance accessed 2026-10-10; change history includes June 2026 active-period work.
- Locator: TimeRange, EntitySelector, Cause/Effect.
- Evidence: Individual-trip delay/cancel usually belongs in TripUpdates. Multiple entity fields in a selector are AND; separate selectors each describe their own affected scope; omitted TimeRange leaves display while in feed.
- Applicability: direct alert scoping at route/two terminal level.

### [S07] GTFS Realtime revision history
- URL: https://gtfs.org/documentation/realtime/change-history/revision-history/
- Version: live revision history through June 2026 as accessed.
- Locator: Dec 2024 feed-version addition; May 2025 ADDED deprecation and NEW/REPLACEMENT.
- Evidence: Records when feed-version linkage entered the maintained spec and later relationship clarifications. History does not prove partner support.
- Applicability: historical context for schedule/RT transitions and producer compatibility.

### [S08] Version-link change chain: issue #362 / PR #434
- URL: https://github.com/google/transit/pull/434
- Related issue: https://github.com/google/transit/issues/362
- Version: PR merged 2024-12-05; related commit shown as 1c7d8b5.
- Locator: issue title, PR discussion and merge metadata.
- Evidence: Missing static version in RT prompted a header field matching feed_info.feed_version. An optional URL was proposed then removed because current/upcoming schedule URL timing can be ambiguous. Swiss producer and TransSee consumer reported using the version to switch GTFS after the header change.
- Applicability: specific released change chain, not evidence this ferry partner implements it.

## Products and analogues

### [S09] OneBusAway Application Modules README
- URL: https://github.com/OneBusAway/onebusaway-application-modules/blob/main/README.md
- Version: moving main docs accessed 2026-10-10; not release-pinned.
- Locator: application interfaces/sign-mode; Getting Started; GTFS Data and Realtime Data Changes.
- Evidence: A large display sign-mode and API are available; setup separates static GTFS URL/timezone and TripUpdates/VehiclePositions/Alerts endpoints with agency and refresh settings.
- Applicability: plausible backend/display alternative; ferry/mismatch behavior still requires testing.

### [S10] OneBusAway releases
- URL: https://github.com/OneBusAway/onebusaway-application-modules/releases
- Version: latest listed v2.7.1 at commit 095bf1a.
- Locator: v2.7.1 metadata.
- Evidence: Identifies the current tagged product release separately from moving README.
- Applicability: candidate release to pin if product fit is validated.

### [S11] DfT SIRI-VM technical guidance
- URL: https://www.gov.uk/government/publications/technical-guidance-publishing-location-data-using-the-bus-open-data-service-siri-vm/technical-guidance-siri-vm
- Version: BODS-specific SIRI-VM 2.0(Q) profile; maintained government publication accessed 2026-10-10.
- Locator: SIRI service family; subscription, heartbeat, UTC and identifier conventions.
- Evidence: SIRI is a modular public transport exchange family. BODS subscribes to incremental VM messages, expects heartbeat/update cadence and identifier consistency; profile adds local rules.
- Applicability: analogue only; bus profile cannot be represented as ferry capability.

### [S12] DfT Bus Open Data implementation guide
- URL: https://www.gov.uk/government/publications/bus-open-data-implementation-guide/bus-open-data-implementation-guide
- Version: DfT guidance for TransXChange 2.4 + SIRI-VM 2.0/2.0Q; maintained page accessed 2026-10-10.
- Locator: Location Matching and timetable revision guidance.
- Evidence: Matching relies on shared IDs; operational journey/block ID changes require a revised timetable file, and partial matching reduces consumer quality.
- Applicability: concrete schedule-plus-operational-update analogy, limited to the specified bus context.


## OpenTripPlanner candidate and consumer history

### [S13] OTP v2.10.0 version pin
- URL: https://github.com/opentripplanner/OpenTripPlanner/releases
- Version: v2.10.0 at commit 521cd5d, 2026-09-09; versioned changelog at https://docs.opentripplanner.org/en/v2.10.0/Changelog/
- Locator: release metadata and 2.10.0 changelog.
- Evidence: Candidate version is pinned to a release rather than moving latest/dev docs.
- Applicability: use only this release for a future pilot fit check.

### [S14] OTP v2.10.0 GTFS-RT configuration
- URL: https://docs.opentripplanner.org/en/v2.10.0/GTFS-RT-Config/
- Version: v2.10.0 documentation.
- Locator: Alerts, TripUpdates via HTTP(S), delay propagation defaults, Vehicle Positions.
- Evidence: Separate updater types attach alert/trip/position feeds to a feedId; HTTP polling defaults to 1 minute; fuzzy trip matching defaults false; updater headers are configurable. Delay propagation has a default with NO_DATA-specific rules.
- Applicability: concrete configuration candidate, not proof of this partner's feed shape, freshness, or fare/ferry behavior.

### [S15] OTP v2.10.0 Feed ID
- URL: https://docs.opentripplanner.org/en/v2.10.0/features-explained/Feed-ID/
- Version: v2.10.0 documentation.
- Locator: GTFS feedId priority and automatic fallback.
- Evidence: feedId scopes a dataset for RT association. Prefer explicit build-config ID; feed_info.feed_id is non-standard; automatic numeric assignment can change when feeds are added.
- Applicability: recommend stable explicit feedId. This is distinct from standard feed_version.

### [S16] OTP stale vehicle snapshot fix
- URL: https://github.com/opentripplanner/OpenTripPlanner/pull/6523
- Version: merged 2025-03-14 commit 273f879; OTP changelog lists it in v2.8.0; target reviewed candidate v2.10.0 is later.
- Locator: PR summary and changelog v2.8.0 detailed change #6523.
- Evidence: Previous polled vehicle-position records were not correctly removed; PR fixes whole-feed replacement semantics and exposes the last position update timestamp.
- Applicability: useful consumer-history chain for VehiclePositions. It does not guarantee a freshness cutoff for trip updates or alerts and does not solve timetable revision switching.

### [S17] OTP feed version exposed through GraphQL
- URL: https://github.com/opentripplanner/OpenTripPlanner/pull/7445
- Version: merged 2026-03-30, included in v2.10.0; initial commit 2bc44a8.
- Locator: PR summary and GraphQL feedVersion schema description; OTP 2.10.0 changelog #7445.
- Evidence: An OTP client can observe the static GTFS version loaded in that OTP instance, avoiding repeated expensive reads when the version is unchanged.
- Applicability: observability only. OTP does not thereby compare the loaded version to an incoming realtime FeedHeader.

### [S18] OTP VehiclePosition missing service date issue
- URL: https://github.com/opentripplanner/OpenTripPlanner/issues/4058
- Related fix: https://github.com/opentripplanner/OpenTripPlanner/pull/4066
- Version: reported against commit b0c9829e3bfe10daddae72485a09a7f48b0be8ff; issue closed in linked PR Apr 22, 2022. Exact first released tag not confirmed.
- Locator: observed behavior, maintainer discussion and closed-by link.
- Evidence: A position without start_date was discarded; maintainers connected service-date resolution to internal per-service-day trip instances; fix inferred the service day.
- Applicability: illustrates missing-field/service-day handling risk; not a verified current-version behavior.

### [S19] OTP v2.10.0 SIRI updater
- URL: https://docs.opentripplanner.org/en/v2.10.0/SIRI-Config/
- Version: v2.10.0 docs; supports Nordic and EPIP profiles, not all SIRI.
- Locator: SIRI overview and HTTPS SIRI-ET/SX updaters.
- Evidence: ET and SX are separate request/response updater types; feedId required and default polling is one minute.
- Applicability: useful alternate only when partner profile/server matches.

 
### [S20] OTP project purpose
- URL: https://github.com/opentripplanner/OpenTripPlanner
- Version: OTP 2 project; the candidate reviewed release is pinned in S13.
- Locator: project overview and README description.
- Evidence: OTP is a multimodal trip-planning backend with APIs for client applications; the repository does not characterize it as a turnkey ferry departure board.
- Applicability: use as an ingestion/API candidate behind a separate board only if existing operations justify its added system surface.


### [S21] Official GTFS digest: initial feed-version proposal
- URL: https://gtfs.org/blog/2024/03/01/gtfs-digest---february-2024/
- Version: February 2024 edition, posted 2024-03-01.
- Locator: Active Proposals, PR #434.
- Evidence: Initial proposal included both a matching feed_version and GTFS_url; it does not establish the later URL-removal discussion.
- Applicability: historical proposal context only.

## Reviser primary-source rechecks

### [S22] Current GTFS Realtime 2.0 relationship and identity rules (recheck of S03/S07)
- URL: https://gtfs.org/documentation/realtime/reference/
- Version/access: maintained reference, specification version 2.0; exact page access observed 2026-10-10T04:25:23Z–04:25:24Z; no immutable commit exposed.
- Locator: TripDescriptor, StopTimeUpdate required fields, ScheduleRelationship NEW and REPLACEMENT.
- Evidence: NEW is unrelated to static trips and requires a new unique trip_id and complete stop updates; REPLACEMENT identifies the static trip to replace and uses a complete replacement journey rather than old static times. Required stop identity, increasing sequence and timing fields are specified. The current reference marks ScheduleRelationship experimental.
- Applicability: directly governs possible partner messages only if the partner actually emits them; this is not local capability or product validation.

### [S23] OTP v2.10.0 dataset association and updater identity (recheck of S14–S15)
- URLs: https://docs.opentripplanner.org/en/v2.10.0/features-explained/Feed-ID/ ; https://docs.opentripplanner.org/en/v2.10.0/GTFS-RT-Config/
- Version/access: OTP v2.10.0 versioned docs; access observed 2026-10-10T04:25:23Z–04:25:24Z.
- Locator: Feed ID definition/assignment and build-config priority; GTFS-RT Alert and TripUpdates updater fields.
- Evidence: OTP assigns feedId to a static dataset at graph build; updater config uses feedId to associate realtime data with the dataset. GTFS trip descriptors separately identify trip instances under the applicable GTFS rules.
- Applicability: candidate OTP configuration distinction only; does not establish pilot deployment or add feedId to the realtime wire schema.

### [S24] PR #434 direct discussion recheck (recheck of S08/S21)
- URLs: https://api.github.com/repos/google/transit/pulls/434 ; https://api.github.com/repos/google/transit/issues/434/comments?per_page=100
- Released record: PR #434 merged 2024-12-05; merge SHA returned by API: 7b9f229dfa0b539c3fcf461986638890024feb06. Comments from 2024-04-10, 2024-09-27, 2024-10-28 and 2024-11-02; exact API access observed 2026-10-10T04:25:52Z.
- Locator: initial PR body; comments at https://github.com/google/transit/pull/434#issuecomment-2047103219, #issuecomment-2378152559, #issuecomment-2441790800 and #issuecomment-2453012128.
- Evidence: participants explain static-feed preparation/provision and realtime activation occur at different times; they report removing gtfs_url and later report Swiss platform publication and TransSee applying a GTFS update after feed_version changed.
- Applicability: confirms what PR participants said, not an independent audit of either deployment or an operator cutover guarantee.

Source IDs S01–S21 remain bound to the source identities in the predecessor source map. S22–S24 are reviser recheck records cross-linked to S03/S07, S14–S15 and S08/S21; they do not replace or rebind predecessor IDs. Exact condition, access, version, applicability and reviewer metadata also appear in `../source-map.json`.
