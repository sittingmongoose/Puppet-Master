# Bounded evidence index — A6-01 investigator

Access batch recorded at 2026-10-10T04:03:12Z. These are public primary specifications, project documentation, and release/issue history; summaries below preserve evidence boundaries. Source IDs map to exact URLs, release/version, locators, observed operation, governing conditions, and applicability in ../source-map.json. Do not silently rebind an ID to another release.

## GTFS Schedule and Realtime

- **S01-GTFS-SCHEDULE-REF-2026-04-27** — [GTFS Schedule Reference](https://gtfs.org/documentation/schedule/reference/), revised 2026-04-27. Dataset/service day, agency timezone, trip/service identifiers, calendar exceptions, extended-hour times.
- **S02-GTFS-RT-REF-2.0** — [GTFS Realtime Reference](https://gtfs.org/documentation/realtime/reference/), spec version 2.0. FeedHeader, optional schedule feed_version, trip instance, NO_DATA, Alert applicability and time ranges.
- **S03-GTFS-TRIP-UPDATES** — [Trip Updates](https://gtfs.org/documentation/realtime/feed-entities/trip-updates/). Absence of a TripUpdate means no realtime information; repeated trip IDs need a service instance key.
- **S04-GTFS-SERVICE-ALERTS** — [Service Alerts](https://gtfs.org/documentation/realtime/feed-entities/service-alerts/). Alerts are separate from individual trip status; active range and entity selectors control display.
- **S05-GTFS-RT-BEST-PRACTICES** — [Realtime Best Practices](https://gtfs.org/documentation/realtime/realtime-best-practices/). Recommends 30-second refresh, 90-second TripUpdate/VehiclePosition data age, 10-minute Alert data age.
- **S06-GTFS-SCHEDULE-REALTIME-ALIGNMENT** — [GTFS Schedule vs GTFS Realtime](https://gtfs.org/resources/mobilitydata-recommendations/gtfs-schedule-vs-gtfs-realtime/). Version and identifier alignment recommendations; short-term disruptions.
- **S07-GTFS-RT-REVISION-HISTORY** — [GTFS Realtime Revision History](https://gtfs.org/documentation/realtime/change-history/revision-history/). Dated field/relationship changes through June 2026.

## Products and implementation routes

- **S08-OTP-GTFS-GRAPHQL** — [OTP GTFS GraphQL API](https://docs.opentripplanner.org/en/latest/apis/GTFS-GraphQL-API/). General-purpose transit API.
- **S09-OTP-GTFS-RT-UPDATERS** — [OTP GTFS-RT Configuration](https://docs.opentripplanner.org/en/latest/GTFS-RT-Config/). Runtime Alert and TripUpdate updater configuration.
- **S10-OTP-CHANGELOG-2.10.0** — [OTP Changelog](https://docs.opentripplanner.org/en/latest/Changelog/), release 2.10.0 on 2026-09-09; exposes GTFS feed version in GraphQL API.
- **S14-OTP-NETEX-SIRI-TUTORIAL** — [OTP NeTEx and SIRI Tutorial](https://docs.opentripplanner.org/en/latest/Netex-Tutorial/). NeTEx + SIRI-ET estimated journeys + SIRI-SX disruption messages in an OTP example.
- **S15-SIRI-README-V2.2** — [TransmodelEcosystem SIRI schemas](https://github.com/TransmodelEcosystem/SIRI), stable v2.2 branch and CEN/release guidance.

## Released consumer history

- **S11-OTP-ISSUE-6252** — [OTP issue #6252](https://github.com/opentripplanner/OpenTripPlanner/issues/6252). OTP 2.7.0-SNAPSHOT, National Rail GTFS+GTFS-RT, observed realtime lag under load; no static schedule version was named.
- **S12-OTP-PR-6262** — [OTP PR #6262](https://github.com/opentripplanner/OpenTripPlanner/pull/6262). Merged 2025-01-09; all polling updaters wait for graph update completion; author reported no unit tests for the performance change.
- **S13-OTP-CHANGELOG-2.7.0** — [OTP 2.7.0 changelog](https://docs.opentripplanner.org/en/v2.7.0/Changelog/), released 2025-03-12; includes PR #6262.

Only public source retrieval was executed. No partner feed or product behavior was tested. See discovery.md for evidence interpretation and proposed NOT_RUN validations.

## Post-release source supplement

These records were inspected after the discovery was frozen and released plan read. They supplement the draft without changing the hash-frozen discovery.

- **S16-OTP-OTPFEATURE-POLL-WAIT-2.10.0** — [OTPFeature.java at release v2.10.0](https://github.com/opentripplanner/OpenTripPlanner/blob/v2.10.0/application/src/main/java/org/opentripplanner/framework/application/OTPFeature.java). The poll-wait feature is enabled by default in this release and can be overridden through configuration.
- **S17-OTP-CHANGELOG-TAG-2.10.0** — [OTP changelog at tag v2.10.0](https://github.com/opentripplanner/OpenTripPlanner/blob/v2.10.0/doc/user/Changelog.md). Release history confirms feed-version exposure in GraphQL and a service-date grouping fix.
- **S18-OTP-PR-6262-POLLING-CODE** — [OTP PR #6262 changed files](https://github.com/opentripplanner/OpenTripPlanner/pull/6262/files). PollingGraphUpdater waits on graph update completion while its feature flag is enabled; source is implementation evidence, not an end-to-end performance test.
