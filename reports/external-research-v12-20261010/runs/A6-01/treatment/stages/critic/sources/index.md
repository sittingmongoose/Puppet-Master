# Critic source index — A6-01 treatment

Source IDs S01–S20 are retained from the investigator map without rebinding. S21 is a supplemental official GTFS source used to partially corroborate the PR #434 proposal context. Full identity, version/commit, locator, conditions, applicability, critic-review status and access window are in [source-map.json](../source-map.json).

## Shared primary-source neighborhoods

- **Schedule identity / service day / time zone / ferry / static version:** [S01](https://gtfs.org/documentation/schedule/reference/), [S02](https://gtfs.org/documentation/overview/)
- **Realtime header, trip identity, update meanings, freshness and alerts:** [S03](https://gtfs.org/documentation/realtime/reference/), [S04](https://gtfs.org/documentation/realtime/realtime-best-practices/), [S05](https://gtfs.org/documentation/realtime/feed-entities/trip-updates/), [S06](https://gtfs.org/documentation/realtime/feed-entities/service-alerts/), [S07](https://gtfs.org/documentation/realtime/change-history/revision-history/)
- **Feed-version history:** [S08](https://github.com/google/transit/pull/434) (direct PR discussion fetch timed out in this review), [S21](https://gtfs.org/blog/2024/03/01/gtfs-digest---february-2024/)
- **Display/backend candidate:** [S09](https://github.com/OneBusAway/onebusaway-application-modules/blob/main/README.md), [S10](https://github.com/OneBusAway/onebusaway-application-modules/releases)
- **SIRI analogue:** [S11](https://www.gov.uk/government/publications/technical-guidance-publishing-location-data-using-the-bus-open-data-service-siri-vm/technical-guidance-siri-vm), [S12](https://www.gov.uk/government/publications/bus-open-data-implementation-guide/bus-open-data-implementation-guide)
- **OTP candidate and consumer history:** [S13](https://github.com/opentripplanner/OpenTripPlanner/releases), [S14](https://docs.opentripplanner.org/en/v2.10.0/GTFS-RT-Config/), [S15](https://docs.opentripplanner.org/en/v2.10.0/features-explained/Feed-ID/), [S16](https://github.com/opentripplanner/OpenTripPlanner/pull/6523), [S17](https://github.com/opentripplanner/OpenTripPlanner/pull/7445), [S18](https://github.com/opentripplanner/OpenTripPlanner/issues/4058), [S19](https://docs.opentripplanner.org/en/v2.10.0/SIRI-Config/), [S20](https://github.com/opentripplanner/OpenTripPlanner)

## Review boundary

Primary-source review occurred within 2026-10-10T04:12:38Z–2026-10-10T04:15:50Z; the browser did not expose per-fetch UTC timestamps. The actual operator’s feed, version, identifiers, SIRI profile, and workflow remain unknown. No downloaded code was run and no product validation was performed.
