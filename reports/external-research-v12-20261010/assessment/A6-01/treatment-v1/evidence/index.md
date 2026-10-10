# Independent evidence — A6-01 treatment-v1

Read-only reviewer retrievals. Raw bytes, decoded texts, UTC windows, exact URLs and SHA-256 hashes are recorded in [retrieval-manifest.json](retrieval-manifest.json). These establish document/code content, not a deployed ferry product.

[Assessment](../assessment.md) · [Assessment JSON](../assessment.json) · [Independent source map](../source-map.json)

[Original inspected hashes](original-artifact-inventory.json) · [Artifact integrity checks](artifact-integrity-checks.json) · [Exact plan clauses](exact-input-clauses.json) · [Reviewer native pre-save receipt](reviewer-native-before-save.json)

## E01

[GTFS Schedule maintained reference](https://gtfs.org/documentation/schedule/reference/)

Locator: Term Definitions; agency.txt; routes.txt; trips.txt; stop_times.txt; calendar/calendar_dates; feed_info.

IDs/calendar/time rules and ferry applicability verified; actual publisher data unknown.

Saved [raw](E01.html) · [text](E01.txt). SHA-256 raw `00fd991d705e8a24298cb8395ef8cf73b2b3116fc50aba74d20f3914319fb8cb`; access 2026-10-10T04:31:51.808819+00:00 to 2026-10-10T04:31:52.436977+00:00.

## E02

[Maintained GTFS overview](https://gtfs.org/documentation/overview/)

Locator: Schedule and Realtime overview.

Supports format/entity families, not individual partner capability.

Saved [raw](E02.html) · [text](E02.txt). SHA-256 raw `28d34f6a0c713745f123983879f289542f43a441315de41eead00da7666ecdda`; access 2026-10-10T04:31:51.810772+00:00 to 2026-10-10T04:31:52.227557+00:00.

## E03

[GTFS Realtime 2.0 maintained reference](https://gtfs.org/documentation/realtime/reference/)

Locator: FeedHeader; Incrementality; TripUpdate; StopTimeEvent/Update; TripDescriptor; Alert/EntitySelector.

Conditional identity and new/replacement/NO_DATA rules verified; enum-wide experimental wording is overbroad.

Saved [raw](E03.html) · [text](E03.txt). SHA-256 raw `299e760ee7d412603b7316e061cd8fca096522d9d07628260797bc6c5339fdac`; access 2026-10-10T04:31:51.811991+00:00 to 2026-10-10T04:31:52.224920+00:00.

## E04

[Maintained GTFS Realtime best practices](https://gtfs.org/documentation/realtime/realtime-best-practices/)

Locator: Feed Publishing; FeedEntity; TripUpdate timestamps.

30-second refresh, 90-second TU/VP and 10-minute alert recommendations; content age differs from fetch/header age.

Saved [raw](E04.html) · [text](E04.txt). SHA-256 raw `acf9424c8ce46422d57f0890913a7554762f8eb4433443a321691d90a6744b61`; access 2026-10-10T04:31:51.813196+00:00 to 2026-10-10T04:31:52.226619+00:00.

## E05

[Maintained Trip Updates guidance](https://gtfs.org/documentation/realtime/feed-entities/trip-updates/)

Locator: StopTimeUpdate propagation examples; TripDescriptor matching.

Missing trip update is no prediction. Omitted later stop updates can inherit delay, unlike explicit NO_DATA.

Saved [raw](E05.html) · [text](E05.txt). SHA-256 raw `d93bce35639b9d9df8768bf981351b4403999fc9dba6d6e8734058e5e91a5e7a`; access 2026-10-10T04:31:51.814240+00:00 to 2026-10-10T04:31:52.324066+00:00.

## E06

[Maintained Service Alerts guidance](https://gtfs.org/documentation/realtime/feed-entities/service-alerts/)

Locator: TimeRange and EntitySelector.

Single-selector conjunction versus separate scopes verified; alerts are not trip timing updates.

Saved [raw](E06.html) · [text](E06.txt). SHA-256 raw `33ef0e23e4db1ee051eddcbbd074cf091a9697e09548dde2ce2a388a4fe9ae63`; access 2026-10-10T04:31:51.815461+00:00 to 2026-10-10T04:31:52.030630+00:00.

## E07

[GTFS RT revision history through June 2026](https://gtfs.org/documentation/realtime/change-history/revision-history/)

Locator: December 2024; May 2025; June 2026.

Version linkage and added/replacement changes adopted; history does not establish partner support.

Saved [raw](E07.html) · [text](E07.txt). SHA-256 raw `d25bab4a7a366f820a53cc37afa6f833206101f41efbad4fa7614642b0bdade1`; access 2026-10-10T04:31:51.817484+00:00 to 2026-10-10T04:31:52.307697+00:00.

## E08

[PR #434 merged 2024-12-05; merge 7b9f229dfa0b539c3fcf461986638890024feb06](https://api.github.com/repos/google/transit/pulls/434)

Locator: body; merged_at; merge_commit_sha.

Initial version+URL proposal and final merge verified.

Saved [raw](E08.json) · [text](E08.txt). SHA-256 raw `571d23ddc9349d2d44865dda4433a505871ba77d325a9f0188739981ba601427`; access 2026-10-10T04:31:51.818722+00:00 to 2026-10-10T04:31:52.221545+00:00.

## E09

[Public PR #434 discussion, 2024](https://api.github.com/repos/google/transit/issues/434/comments?per_page=100)

Locator: issuecomment-2047103219; 2378152559; 2441790800; 2453012128.

Different publication/activation times and participant-reported Swiss/TransSee uses verified as attributed reports.

Saved [raw](E09.json) · [text](E09.txt). SHA-256 raw `b956681b0eedd4c1e483fb68a21daddce6f807647a34c571850a889f7ceaa319`; access 2026-10-10T04:31:52.030781+00:00 to 2026-10-10T04:31:52.440331+00:00.

## E10

[Issue #362, opened 2022-12-12](https://api.github.com/repos/google/transit/issues/362)

Locator: title and body.

Winter-schedule mismatch incident is reporter evidence; does not demonstrate operator behavior.

Saved [raw](E10.json) · [text](E10.txt). SHA-256 raw `5bca4baec2ffea11a378c4e769f59fb3207804c3d5d211c5f2ae75fddacd89eb`; access 2026-10-10T04:31:52.221660+00:00 to 2026-10-10T04:31:52.439872+00:00.

## E11

[OneBusAway moving main README](https://raw.githubusercontent.com/OneBusAway/onebusaway-application-modules/main/README.md)

Locator: Application Suite/sign-mode; GTFS Data/Realtime Data Changes.

Sign-mode and separate RT endpoints verified; no tagged ferry/staleness/editor capability inferred.

Saved [raw](E11.md) · [text](E11.txt). SHA-256 raw `827c0670ca41dbf813c377d6f772dcd1af83d2317dbc675f3b9230ad96e905dc`; access 2026-10-10T04:31:52.225363+00:00 to 2026-10-10T04:31:52.438909+00:00.

## E12

[OBA v2.7.1 latest release, published 2026-02-08](https://api.github.com/repos/OneBusAway/onebusaway-application-modules/releases/latest)

Locator: tag_name; published_at; body.

Release label verified independently; not a release pin for moving README semantics.

Saved [raw](E12.json) · [text](E12.txt). SHA-256 raw `9dfccec3b4840cf89b4c76cd0ad3f84dac05aeb7bd73612d9a2ca3667acc6dff`; access 2026-10-10T04:31:52.226822+00:00 to 2026-10-10T04:31:52.431654+00:00.

## E13

[DfT SIRI-VM 2.0(Q) BODS profile, published 2020-10-21](https://www.gov.uk/government/publications/technical-guidance-publishing-location-data-using-the-bus-open-data-service-siri-vm/technical-guidance-siri-vm)

Locator: SIRI standards family; Real-time information; Heartbeat; profile; UTC; identity fields.

Bus-specific modular analogue, 30-second producer update/heartbeat, distinct central consumer polling and timestamp conditions verified.

Saved [raw](E13.html) · [text](E13.txt). SHA-256 raw `df15cb95ba2914b7c9514580f02d1c388248117764cf774fafacade1741fd675`; access 2026-10-10T04:31:52.227702+00:00 to 2026-10-10T04:31:52.717251+00:00.

## E14

[DfT implementation guide: TxC 2.4, SIRI-VM 2.0/2.0Q](https://www.gov.uk/government/publications/bus-open-data-implementation-guide/bus-open-data-implementation-guide)

Locator: Publishing location data; Location Matching; Time Synchronisation.

Shared identifiers and revised TxC on operational identifier changes verified; bus applicability only.

Saved [raw](E14.html) · [text](E14.txt). SHA-256 raw `c0629de815a4e761c66bfbf9e43c83733453a5b12dc2b0d758e8092a87c95f53`; access 2026-10-10T04:31:52.307877+00:00 to 2026-10-10T04:31:52.854707+00:00.

## E15

[OTP v2.10.0 release, published 2026-09-09](https://api.github.com/repos/opentripplanner/OpenTripPlanner/releases/tags/v2.10.0)

Locator: tag_name; published_at; body.

Candidate release date and link to versioned changelog verified.

Saved [raw](E15.json) · [text](E15.txt). SHA-256 raw `0fe611aae453367a94f9e9537880926c2540088e3e370f53f42c73ba6274d73a`; access 2026-10-10T04:31:52.324215+00:00 to 2026-10-10T04:31:52.585569+00:00.

## E16

[OTP v2.10.0 changelog](https://docs.opentripplanner.org/en/v2.10.0/Changelog/)

Locator: 2.10.0 #7445; 2.8.0 #6523 and #6028.

Release inclusions verified. #6523 is positions cleanup; #6028 also records released NEW/REPLACEMENT support.

Saved [raw](E16.html) · [text](E16.txt). SHA-256 raw `2b562ca78a01d9bdf8bb6bcd733d1bcc2313e6150467ffa66f8ae1e646141f94`; access 2026-10-10T04:31:52.431735+00:00 to 2026-10-10T04:31:52.721932+00:00.

## E17

[OTP v2.10.0 versioned updater documentation](https://docs.opentripplanner.org/en/v2.10.0/GTFS-RT-Config/)

Locator: Alerts; TripUpdates HTTP; Vehicle Positions; delay propagation.

feedId required, frequency duration PT1M, fuzzyTripMatching boolean false; backwards required-no-data and forwards default verified.

Saved [raw](E17.html) · [text](E17.txt). SHA-256 raw `29f34e7533968d5a1aa9a18ab0cbc4beb7a54ebdc2063d4154c49974beb92b45`; access 2026-10-10T04:31:52.437747+00:00 to 2026-10-10T04:31:52.583054+00:00.

## E18

[OTP v2.10.0 Feed ID documentation](https://docs.opentripplanner.org/en/v2.10.0/features-explained/Feed-ID/)

Locator: Determining feedId and GTFS priority.

Graph-build namespace, build-config priority, nonstandard feed_id, numeric fallback verified; not feed_version.

Saved [raw](E18.html) · [text](E18.txt). SHA-256 raw `f1c6fa86039a5021847792de6368f06bc33f3a90adefe98240a4f5ac2ed1ff35`; access 2026-10-10T04:31:52.439008+00:00 to 2026-10-10T04:31:52.718305+00:00.

## E19

[OTP PR #6523 merged 2025-03-14; 273f879efaa8b8f43bfbce271611c40ed7b765cf](https://api.github.com/repos/opentripplanner/OpenTripPlanner/pulls/6523)

Locator: body and merge fields.

Per-download position cleanup and ISO timestamp change verified at PR level.

Saved [raw](E19.json) · [text](E19.txt). SHA-256 raw `44a4b1f6280c7507ef017e9e5e90a4629461f1dc865ae8c3bbf5458f670e6460`; access 2026-10-10T04:31:52.439938+00:00 to 2026-10-10T04:31:52.721538+00:00.

## E20

[PR #6523 changed source files at head 9892fe617715a52525ff96aff5665ce32b8ffa12](https://api.github.com/repos/opentripplanner/OpenTripPlanner/pulls/6523/files?per_page=100)

Locator: DefaultRealtimeVehicleService; RealtimeVehiclePatternMatcher; VehiclePositionImpl; schema; tests.

Code removes prior records per feed before immutable replacement. ISO lastUpdate is vehicle observation time; no generic TU/Alert age or revision guard demonstrated.

Saved [raw](E20.json) · [text](E20.txt). SHA-256 raw `7aa299c547c654c73223ff4dd8ead32c6c1f0cbe8dc61a214201bd8787f7e142`; access 2026-10-10T04:31:52.440411+00:00 to 2026-10-10T04:31:52.745177+00:00.

## E21

[OTP PR #7445 merged 2026-03-30; 630a12684be707732052002ac23042d09c3ccaab](https://api.github.com/repos/opentripplanner/OpenTripPlanner/pulls/7445)

Locator: body and merge fields.

Static feed-version exposure verified; no automatic RT-header reconciliation claim supported.

Saved [raw](E21.json) · [text](E21.txt). SHA-256 raw `6c35fd0a27a87b35914ea133fbe7673f477ba3386d8c92fe4ceb43a210960427`; access 2026-10-10T04:31:52.583193+00:00 to 2026-10-10T04:31:52.883942+00:00.

## E22

[PR #7445 changed files at head 23dfb2646afffc67d7c4e3d71b50bc930df4672f](https://api.github.com/repos/opentripplanner/OpenTripPlanner/pulls/7445/files?per_page=100)

Locator: FeedImpl.version; schema Feed.version; integration expectations.

Actual added GraphQL field is version, not feedVersion; the exposure capability is supported.

Saved [raw](E22.json) · [text](E22.txt). SHA-256 raw `6591ff1926fd6973d2e0692e06e81b38f5fa43b5969cfd1d3b912191722638c3`; access 2026-10-10T04:31:52.585633+00:00 to 2026-10-10T04:31:52.989900+00:00.

## E23

[OTP issue #4058, reported against b0c9829e3bfe10daddae72485a09a7f48b0be8ff](https://api.github.com/repos/opentripplanner/OpenTripPlanner/issues/4058)

Locator: Observed behavior; reported version/config; closed_at.

Missing-start_date VehiclePositions failure is verified historical reporter evidence.

Saved [raw](E23.json) · [text](E23.txt). SHA-256 raw `32b4109be0632eca52ee2408ee13995377759110fd3a1ec1da40b7b4fb402ec4`; access 2026-10-10T04:31:52.717444+00:00 to 2026-10-10T04:31:52.888363+00:00.

## E24

[OTP issue #4058 discussion, April 2022](https://api.github.com/repos/opentripplanner/OpenTripPlanner/issues/4058/comments?per_page=100)

Locator: issuecomment-1086669607; 1088357382; 1088359207; 1088721291.

Service-date/internal trip association and proposed inference explained; first tagged fix release remains unestablished in candidate.

Saved [raw](E24.json) · [text](E24.txt). SHA-256 raw `f90fc5a7d0044d0ba5ec3280df3f9f6b1728a68caa0f46f46f33eae9c29ca6ea`; access 2026-10-10T04:31:52.718422+00:00 to 2026-10-10T04:31:52.875122+00:00.

## E25

[OTP PR #4066 merged 2022-04-22; d9bf0bbec860c66591a993ee62760447b9f00537](https://api.github.com/repos/opentripplanner/OpenTripPlanner/pulls/4066)

Locator: body; closes #4058; merge fields.

Linked inference fix verified; changelog explicitly skipped, matching bounded uncertainty.

Saved [raw](E25.json) · [text](E25.txt). SHA-256 raw `0bb8d9787223abe3d530babb6a06776f5a72c09db2e7e9c587b7d0e15aadbbf8`; access 2026-10-10T04:31:52.721605+00:00 to 2026-10-10T04:31:52.938942+00:00.

## E26

[OTP v2.10.0 SIRI configuration](https://docs.opentripplanner.org/en/v2.10.0/SIRI-Config/)

Locator: Overview; ET and SX request/response tables.

Nordic/EPIP subset profiles; required feedId and default PT1M; partner profile unknown.

Saved [raw](E26.html) · [text](E26.txt). SHA-256 raw `f8009e23007270c3701cf064e923413d9d50b29be035cf639058cfe03709abc3`; access 2026-10-10T04:31:52.722490+00:00 to 2026-10-10T04:31:52.864676+00:00.

## E27

[OTP v2.10.0 tagged README](https://raw.githubusercontent.com/opentripplanner/OpenTripPlanner/v2.10.0/README.md)

Locator: Overview; Repository Layout.

GraphQL multimodal backend and customary separate clients verified; no turnkey ferry-board promise.

Saved [raw](E27.md) · [text](E27.txt). SHA-256 raw `5d74bd0936fd43a489eec2bc087d20f3384d546063e231a219f759e8ee73305e`; access 2026-10-10T04:31:52.745248+00:00 to 2026-10-10T04:31:52.876544+00:00.

## E28

[Official February 2024 GTFS Digest, posted 2024-03-01](https://gtfs.org/blog/2024/03/01/gtfs-digest---february-2024/)

Locator: Active Proposals #434.

Initial version+URL proposal verified separately from adopted field.

Saved [raw](E28.html) · [text](E28.txt). SHA-256 raw `f7f8b53d3af54f264b19c10dc069ef807c8119e27459a3ee3e37737e9d085764`; access 2026-10-10T04:31:52.854921+00:00 to 2026-10-10T04:31:52.990357+00:00.

## E29

[OTP v2.10.0 tagged GTFS GraphQL schema](https://raw.githubusercontent.com/opentripplanner/OpenTripPlanner/v2.10.0/application/src/main/resources/org/opentripplanner/apis/gtfs/schema.graphqls)

Locator: type Feed lines 756-770.

Feed.version is nullable String; feedId is String!. No feedVersion property in this schema.

Saved [raw](E29.txt) · [text](E29.txt). SHA-256 raw `ee5c42d5fd6346b6062d057030f8cb2062517b31e93add66ca5a92cae247aac4`; access 2026-10-10T04:33:21.572339+00:00 to 2026-10-10T04:33:21.727709+00:00.

## E30

[OTP v2.10.0 tagged FeedImpl.java](https://raw.githubusercontent.com/opentripplanner/OpenTripPlanner/v2.10.0/application/src/main/java/org/opentripplanner/apis/gtfs/datafetchers/FeedImpl.java)

Locator: version() lines 69-72.

Fetches loaded static FeedInfo.version; not realtime header version.

Saved [raw](E30.txt) · [text](E30.txt). SHA-256 raw `ce32b00f3eb3463bc8e5a441b4b5c4c755cdd2af31ac7e48452794ae77e10be6`; access 2026-10-10T04:33:21.573665+00:00 to 2026-10-10T04:33:21.710102+00:00.

## E31

[OTP v2.10.0 annotated tag reference](https://api.github.com/repos/opentripplanner/OpenTripPlanner/git/ref/tags/v2.10.0)

Locator: object.sha and object.type.

Tag points to tag object 35d23ad9b23321685bdc49351c744004044611be; peeled by E34.

Saved [raw](E31.json) · [text](E31.json). SHA-256 raw `5ad175ea6659af2c86569d29544cdedf2a9ff419bbaef999dcf60c6e68109f0c`; access 2026-10-10T04:33:21.575130+00:00 to 2026-10-10T04:33:21.733797+00:00.

## E32

[OBA v2.7.1 tag reference](https://api.github.com/repos/OneBusAway/onebusaway-application-modules/git/ref/tags/v2.7.1)

Locator: object.sha.

Tag commit 095bf1ac3aeb7009b9f78e7f1cb4c65bd38b988a verified.

Saved [raw](E32.json) · [text](E32.json). SHA-256 raw `f5edc94432ab220fa1b48969b481fdea4ea820bd94906cb15ce8c92d65469373`; access 2026-10-10T04:33:21.576371+00:00 to 2026-10-10T04:33:21.755537+00:00.

## E33

[GTFS Realtime proto on mutable master](https://raw.githubusercontent.com/google/transit/master/gtfs-realtime/proto/gtfs-realtime.proto)

Locator: FeedHeader; TripDescriptor relationship enum; StopTimeUpdate.

Wire types and individual experimental NEW/REPLACEMENT markers corroborate current reference; prose comments can lag maintained reference.

Saved [raw](E33.txt) · [text](E33.txt). SHA-256 raw `8feff2c5499e0ff08777e203e49ef702e07be0a8376b8bb2126add311a709299`; access 2026-10-10T04:33:21.578091+00:00 to 2026-10-10T04:33:21.717691+00:00.

## E34

[OTP v2.10.0 tag object](https://api.github.com/repos/opentripplanner/OpenTripPlanner/git/tags/35d23ad9b23321685bdc49351c744004044611be)

Locator: object.sha.

Peeled release commit 521cd5d8acaae628878f43bf5946f4942c118548 verified.

Saved [raw](E34.json) · [text](E34.json). SHA-256 raw `fb4905799593bbf1769bff1efa90d34d907920454e14fd6bc7f1ca39f69acc2d`; access 2026-10-10T04:34:05.463925+00:00 to 2026-10-10T04:34:05.608249+00:00.

