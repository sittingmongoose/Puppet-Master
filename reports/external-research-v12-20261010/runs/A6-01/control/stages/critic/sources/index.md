# Critic evidence index — A6-01-control

The critic directly reopened and checked these primary pages on 2026-10-10; the final multi-page request began at 04:20:08 UTC. Source IDs retain the investigator's exact URL identity where reused. S19 is new, commit-pinned evidence. See [source-map.json](../source-map.json) for exact URL, release/version, locator, access UTC, observed operation, governing conditions/defaults, applicability, and independent review notes. No source retrieval is a product validation.

## GTFS Schedule and Realtime

- **S01-GTFS-SCHEDULE-REF-2026-04-27** — [GTFS Schedule Reference](https://gtfs.org/documentation/schedule/reference/), revised 2026-04-27. Checked service day, agency time zone, date exceptions, DST time basis, extended hours, and the `frequencies.txt` `exact_times` distinction.
- **S02-GTFS-RT-REF-2.0** — [GTFS Realtime Reference](https://gtfs.org/documentation/realtime/reference/), protocol version 2.0. Checked optional schedule `feed_version`, ID resolution, TripDescriptor instance fields and schedule relationships.
- **S03-GTFS-TRIP-UPDATES** — [Trip Updates](https://gtfs.org/documentation/realtime/feed-entities/trip-updates/). Checked no-update semantics, repeated trip IDs, and update relationship examples.
- **S04-GTFS-SERVICE-ALERTS** — [Service Alerts](https://gtfs.org/documentation/realtime/feed-entities/service-alerts/). Checked individual-trip guidance, active ranges, missing-range behavior, and entity-selector scope.
- **S05-GTFS-RT-BEST-PRACTICES** — [Realtime Best Practices](https://gtfs.org/documentation/realtime/realtime-best-practices/). Checked 30-second refresh recommendation and 90-second/10-minute entity-age recommendations.
- **S06-GTFS-SCHEDULE-REALTIME-ALIGNMENT** — [GTFS Schedule vs GTFS Realtime](https://gtfs.org/resources/mobilitydata-recommendations/gtfs-schedule-vs-gtfs-realtime/). Version-alignment/release guidance; not a consumer enforcement rule.
- **S07-GTFS-RT-REVISION-HISTORY** — [GTFS Realtime Revision History](https://gtfs.org/documentation/realtime/change-history/revision-history/). Checked December 2024 version field, May 2025 trip relationships, and June 2026 alert periods.

## OpenTripPlanner routes and released behavior

- **S08-OTP-GTFS-GRAPHQL** — [OTP GTFS GraphQL API](https://docs.opentripplanner.org/en/latest/apis/GTFS-GraphQL-API/). General-purpose API documentation; moving “latest” page.
- **S09-OTP-GTFS-RT-UPDATERS** — [OTP GTFS-RT Configuration](https://docs.opentripplanner.org/en/latest/GTFS-RT-Config/). Separate Alert and TripUpdate updater configuration and defaults; pin an actual deployment release.
- **S10-OTP-CHANGELOG-2.10.0** — [OTP Changelog](https://docs.opentripplanner.org/en/latest/Changelog/), release 2.10.0 (2026-09-09). Feed-version exposure and service-date grouping changes.
- **S11-OTP-ISSUE-6252** — [OTP issue #6252](https://github.com/opentripplanner/OpenTripPlanner/issues/6252). OTP 2.7.0-SNAPSHOT/National Rail report of up to 20-minute realtime lag; no static timetable revision identified.
- **S12-OTP-PR-6262** — [OTP PR #6262](https://github.com/opentripplanner/OpenTripPlanner/pull/6262). Merged 2025-01-09; poll-wait fix; PR body says no unit tests, which is qualified by S19.
- **S13-OTP-CHANGELOG-2.7.0** — [OTP 2.7.0 Changelog](https://docs.opentripplanner.org/en/v2.7.0/Changelog/), dated 2025-03-12; records #6262 release inclusion.
- **S16-OTP-OTPFEATURE-POLL-WAIT-2.10.0** — [OTPFeature.java at v2.10.0](https://github.com/opentripplanner/OpenTripPlanner/blob/v2.10.0/application/src/main/java/org/opentripplanner/framework/application/OTPFeature.java). Exact release source: wait feature enabled by default.
- **S17-OTP-CHANGELOG-TAG-2.10.0** — [OTP changelog at v2.10.0](https://github.com/opentripplanner/OpenTripPlanner/blob/v2.10.0/doc/user/Changelog.md). Release-tagged feed-version and service-date changes.
- **S18-OTP-PR-6262-POLLING-CODE** — [OTP PR #6262 changed files](https://github.com/opentripplanner/OpenTripPlanner/pull/6262/files). Feature-gated future wait in polling graph updater; implementation evidence, not a load test.
- **S19-OTP-PR-6262-TEST-COMMIT-69AC485** — [OTP commit 69ac485](https://github.com/opentripplanner/OpenTripPlanner/commit/69ac485). Adds a narrow feature-on/off asynchronous graph-writer unit test; does not cover performance/load or the ferry feed.

## SIRI / NeTEx analogue

- **S14-OTP-NETEX-SIRI-TUTORIAL** — [OTP NeTEx and SIRI Tutorial](https://docs.opentripplanner.org/en/latest/Netex-Tutorial/). Norwegian NeTEx example and separate SIRI-ET/SIRI-SX updaters; no evidence the partner uses it.
- **S15-SIRI-README-V2.2** — [TransmodelEcosystem SIRI repository](https://github.com/TransmodelEcosystem/SIRI). Current branch table distinguishes v2.3 (latest schema branch with functional improvements) from v2.2 (latest matching CEN documentation, bug fixes only); use a release when an exact CEN-matching schema is required.
