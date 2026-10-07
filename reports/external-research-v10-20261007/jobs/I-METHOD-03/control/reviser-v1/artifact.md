# I-METHOD-03 — complete revised plan: transit transfer review kiosk

**Status:** Complete candidate revision for this bounded arm. This is a product plan and proposed validation set, not an implementation or test report. It is based on the exact researcher draft/source map, exact critic artifact/source map, and the captured source bytes linked under sources/. The original brief, frozen plan, other campaign material, assessor feedback, and other-arm material were not opened. No unsupported product choice is treated as settled.

## Recommendation

Retain the small, read-only kiosk scope: two agencies, twenty selected stops, and one selected two-route transfer view. Present a scheduled transfer margin separately from any current, identified, timestamped agency observation. A missing, stale, or unusable observation is not evidence that a vehicle is on time, and a displayed margin does not confirm that a connection will be made.

The safety case remains the distinction between schedule and realtime. The captured Trip Updates guidance says that absence of a TripUpdate means no realtime data and must not be interpreted as on time. It also describes an early-arrival stop update being dropped before its scheduled arrival: the consumer then has no realtime timing for that stop and uses schedule data. [E2] The captured OneBusAway issue documents the rider-facing jump from realtime to schedule; its proposed hide-negative-schedule PR is closed and unmerged, while the GTFS Realtime clarification PR is merged. This supports rejecting the hide-the-time mitigation; it does not establish that a OneBusAway application fix shipped. [E16–E18]

## O1 — User problem and bounded response

The kiosk helps a volunteer or rider compare one selected scheduled transfer with a separate optional realtime observation and its source age. It does not predict vehicle movement from a raw location, turn missing data into “on time,” promise a timed connection, or imply dispatch coordination. Keep the frozen scope and exclusions: twenty selected stops, two selected routes, one transfer view, read-only rider use, no occupancy claims, no accessibility-availability claims, and no dispatch action. Product choices still open below must be resolved before the corresponding feature is presented as supported.

The transferred discovery does not identify real agencies, feeds, terms, network conditions, or target hardware. No claim here depends on those unknowns.

## P1 — Feed intake, identity, and provenance

1. Admit operator-selected public GTFS Schedule archives and optional GTFS Realtime TripUpdates. Keep each feed as its own identifier namespace. Store feed and agency identity with trip, route, and stop IDs; never join separate feeds on a bare ID.
2. For each immutable schedule snapshot, record its feed identity, acquisition time, content hash, declared version and effective period, parser version, and validation status. Replacing a schedule creates a new snapshot; it does not rewrite evidence for an earlier displayed transfer.
3. For each realtime response, keep acquisition time distinct from FeedHeader time and the relevant TripUpdate time. Do not let a refreshed header conceal old entity data. Missing required timing fields mean age is unknown. Record the trip descriptor and the stop-time evidence used for any displayed value.
4. Service Alerts are removed from the MVP intake claim. Their relationship to a selected trip, stop, route, or transfer and their rider-facing effect have not been specified. They remain a possible later choice requiring a bounded supported subset and explicit display/suppression rules. Do not imply the current transfer calculation incorporates alerts. If an alert is later admitted, the captured ten-minute age recommendation is only a starting threshold, not a correctness guarantee. [E4]
5. VehiclePositions and crowdsourced reports are not inputs to the initial transfer calculation. They may be considered later only after separate trust, freshness, privacy, moderation, and retention choices. A position is not an arrival prediction.
6. Do not publish credentials or secret query values in pages, logs, or public provenance. Actual feed access method and source terms remain unknown. Public source replay is conditional on permission under the actual source terms; availability at a public URL alone does not establish permission to retain or republish it.
7. MobilityData GTFS Validator v8.0.1 is an optional static-feed preflight that can produce operator-readable findings. It is not selected as the runtime schedule parser, realtime decoder, trip selector, or transfer calculator. Verify a future runtime parser and actual feeds against the admitted features before adopting either. [E5]

## P2 — Rider and volunteer view

Keep the twenty-stop limit and one selected transfer between two selected routes. Show the stop or explicitly mapped transfer location; arriving and departing route; direction/headsign when available; service date; agency-local time; schedule snapshot/effective date; and an explicit source label on each time.

The pairing of the arriving and departing trips is still a product decision. Until a pair is explicitly selected or selected by a specified, validated rule, do not present a computed margin. The kiosk remains read-only and needs no rider account, identifier, device identity, location, or journey history. An operator view can show feed status and parser errors without asking riders to interpret raw CSV or protobuf.

With no usable current TripUpdate, show the schedule with its acquisition/effective date and a separate “no current observation” state. Distinguish missing observation, stale data, unknown age, identifier mismatch, skipped/cancelled service, fetch error, and parse error. If the service date is outside the schedule's effective or active period, do not silently present that snapshot as current. Offline use may retain a schedule snapshot and an old observation, but the old observation must keep its original timestamp and be marked offline/stale.

## P3 — Transfer interpretation and limits

### Scheduled comparison

For a specific selected arriving trip, departing trip, and mapped transfer location, calculate:

**scheduled margin = outgoing scheduled departure − incoming scheduled arrival − applicable transfer allowance**

Show scheduled arrival, departure, allowance, and margin separately, with units. Resolve applicable transfers.txt rules by the specification's specificity ordering. A conflicting or ambiguous rule must produce a review/error state and no margin; do not guess. A transfer_type 3 rule prohibits the transfer and cannot be replaced by generic walking time. For type 2, honor min_transfer_time. A rider-configured allowance is subject to the applicable minimum; the default/editable value remains undecided.

Keep transfer types distinct:

- Type 0 or empty is a recommended transfer point.
- Type 1 is a timed relationship where the departing vehicle is expected to wait. This is not a promise from the kiosk.
- Type 2 requires a minimum transfer time.
- Type 3 prohibits a transfer at the location.
- Type 4 permits a linked in-seat transfer on the same vehicle.
- Type 5 disallows an in-seat transfer and requires alighting and re-boarding.

Do not compress types 4 and 5 into one label. Until linked-trip semantics are implemented and validated, keep both out of the computed ordinary-transfer display and label them separately as unsupported/review-only. [E1]

### Frequency service and cross-feed joins

The schedule reference distinguishes frequency-based service with exact_times=0, which has no fixed schedule, from compressed fixed-schedule service with exact_times=1. The inherited fixed-time margin cannot be applied to exact_times=0 as if it were a fixed departure. Initially withhold a computed scheduled margin for that case and show an explicit “no fixed schedule / margin unavailable” state. Exact_times=1 may be considered only after the parser and trip-time expansion are validated; no such implementation was examined. Do not invent a headway-based transfer probability. [E1]

The two-agency view needs an explicit inter-feed location decision. Choose either a single merged feed or a curated cross-feed stop/platform crosswalk before calculating an inter-agency transfer. Do not infer a physical match from equal stop IDs. Define how station-versus-platform relationships map. Unmapped or ambiguous locations produce no cross-feed margin. Trip-pair selection and location mapping are both open product decisions, not defaults established by the source packet.

### Realtime comparison

Only show a separate “observed/predicted margin as of [source timestamp]” when the selected trip instance and relevant stop-time update can be joined to the correct feed, service date, and mapped location. For repeated visits to the same stop, use stop_sequence to disambiguate. Apply GTFS Realtime stop-time relationships and delay propagation; a TripUpdate for a trip alone is not a prediction for every requested stop. A NO_DATA relationship means no timing information, and a skipped stop is not an arrival prediction. Do not claim confidence unless a product choice defines how optional uncertainty is displayed. [E2, E3]

Withhold the realtime margin for absent or stale entity data; unknown timestamps; mismatched trip, stop, or sequence; unsupported frequency cases; cancelled or skipped service; missing usable stop-time timing; or an unresolved transfer/location rule. Never blend schedule and realtime into one unexplained value. Keep the persistent notice: “Times are based on the named schedule and, when shown, a timestamped agency observation. A displayed margin does not confirm that a connection will be made.”

## P4 — Volunteer review and seven-day history

Retain the seven-day public-history limit and no-rider-identity constraint. For each displayed comparison, preserve an immutable record of the schedule snapshot identity/hash and effective dates; permitted realtime response identity/hash and acquisition/header/entity timestamps; feed-scoped route, trip, and stop identifiers; service date and agency timezone; transfer rule and allowance; parser/calculator versions; source state; values displayed; and the reason any value was withheld. Preserve the rendered kiosk state separately from source evidence. A later observation appends a record; it does not mutate an earlier display.

Before retaining raw source snapshots or making them publicly replayable, check the actual feed terms and access conditions. If public raw retention is not permitted, retain only the parsed inputs and hashes that are permitted, state that replay is limited, and do not claim a volunteer can reproduce unavailable raw content from a hash alone. The actual terms and whether screens or only structured records count as seven-day history are unresolved. Keep credentials and secret query values out of public pages and logs.

OneBusAway's server validator is only an evidence-shape analogy from the researcher draft: a structured, reviewable report can separate a verdict from execution success. Do not adopt its server deployment, keyed job trigger, or database workflow for this kiosk. [E20]

## P5 — Components, service time, freshness, and offline behavior

Keep schedule parsing, timestamp interpretation, and the limited transfer calculation as explicit, versioned components behind small interfaces. The runtime parser and transfer-calculation implementation remain unselected.

The bounded component candidate is MobilityData GTFS Validator v8.0.1 for optional static preflight. Its ServiceWindow implementation resolves service intervals for trip service IDs and returns the earliest start and latest end across nonempty services. It is a feed-wide envelope, not proof of continuous service on each date, a trip selector, a transfer calculator, or a realtime validator. The cache applies calendar.txt intervals and calendar_dates.txt additions/removals; inspected tests cover optional-table and interval cases. The release/application evidence is limited to this metadata calculation. No validator build, test, or agency-feed validation was performed. [E5–E10]

The separate issue #2017 links to PR #2029, whose fix is described in the release notes and whose later v8.0.1 source/tests were inspected. The separate #2099 report is not presented as linked to or individually verified fixed by #2029. Do not extend this evidence to transfer correctness or realtime freshness. [E11–E15]

Interpret schedule times as service-day values in the agency timezone, retain the original service date and time text, and convert to instants only after applying that agency's schedule semantics. GTFS time can exceed 24:00 and its origin is “noon minus 12 hours,” which differs from ordinary midnight on daylight-saving transition days. In a single GTFS dataset, agencies share agency_timezone; the kiosk's two-feed cross-agency comparison still needs separate timezone conversion. The exact conversion library, feed conventions, and daylight-saving fold/gap policy are unresolved and require validation against actual feeds. [E1]

Use the captured GTFS Realtime recommendations as starting alert thresholds only: source-data age no greater than 90 seconds for TripUpdates and VehiclePositions, ten minutes for Service Alerts, with refresh at least every 30 seconds. They are producer recommendations, not guarantees of prediction quality or service correctness. Make any adopted thresholds configurable by feed and display actual ages. Keep freshness states separate: fresh, stale, unknown age, missing observation, and fetch/parse error. [E4]

On intermittent connectivity, retain the last schedule snapshot with its effective period and acquisition time. Show any prior observation only with its original timestamp and an offline/stale label. Operator errors should identify the failed feed and last successful acquisition. Tablet layout, cache behavior, refresh load, and performance remain unverified until the target device and network are selected.

## P6 — Proposed validation and acceptance

All checks below are proposals. The researcher and critic report no application build, app tests, validator execution, real agency-feed fetch, or performance measurement. Do not report these proposals as executed results.

1. **Snapshot and namespace:** import schedule A, save a displayed comparison, replace it with B, and prove the original record still cites A while the new view cites B. Use colliding bare IDs in separate feeds and confirm they cannot join without an explicit crosswalk.
2. **Missing, stale, and early-drop realtime:** exercise no TripUpdate, no stop update, old entity with a refreshed header, unknown timestamp, fetch and parse errors, NO_DATA, cancellation, skipped stop, and mismatched trip/stop. Verify each state is distinct and no unsupported margin is shown. Include the captured early-arrival fixture: scheduled Stop 4 at 10:20, predicted 10:18, update dropped at 10:18; display no realtime timing for that stop and schedule only as schedule.
3. **Stop-level joins:** test a repeated stop_id with stop_sequence; delay propagation across omitted updates; NO_DATA resetting timing information; SKIPPED behavior; and a trip-level update with no usable timing for the requested stop. Confirm that a trip-level match alone does not create a stop prediction. Decide whether optional uncertainty is displayed before making any confidence claim.
4. **Transfer rules:** cover positive, zero, and negative scheduled margins; allowance and type 2 minimum; specificity ordering; conflicting/equally maximal rules as an error; type 3 prohibition; type 1 without a wait promise; and separate type 4 and type 5 review-only behavior.
5. **Frequency:** fixtures for exact_times=0 and exact_times=1. The first must withhold a fixed scheduled margin. The second remains withheld until schedule expansion and selected trip handling are validated.
6. **Cross-feed identity and pairing:** test a curated crosswalk or merged-feed choice, unmapped/ambiguous stops, station/platform cases, colliding IDs, separate agency timezones, and selected trip-pair behavior. Do not accept an implicit cross-feed join.
7. **Service date and validator scope:** calendar weekday boundaries, calendar_dates additions/removals, calendar-only, dates-only, both tables, and no active service. If v8.0.1 is chosen as a preflight, retain its versioned report and check its result against the intended date-specific behavior; do not treat its earliest/latest envelope as proof of daily service. The upstream tests were inspected, not run.
8. **Overnight and daylight saving:** include service time 25:35:00 with its original service date and spring/fall transition fixtures in each actual agency timezone. Finalize fold/gap behavior only after feed-specific review.
9. **Alerts:** no alert behavior is in MVP. If alerts are later selected, add tests for the bounded supported alert scope, matching, display/suppression, freshness, and ensuring alerts do not silently change a transfer calculation.
10. **History, privacy, and offline:** keep screen and source records separate and immutable; enforce seven-day retention; exclude rider/device identity; verify source terms before public raw replay; and make offline observations visibly stale with their last acquisition time.
11. **Performance:** on the agreed tablet and network, measure the twenty-stop/one-transfer view under warm cache and fresh refresh; record p50/p95, payload size, and source-fetch latency separately. Set an acceptance threshold only after device, network, and refresh load are chosen. No speed claim is currently supported.

## Comparison against every frozen plan decision

| Frozen plan | Disposition | Revised treatment |
|---|---|---|
| P1 — Feed intake | Retain with corrections | Keep public Schedule and optional TripUpdates, immutable snapshots, source age and identity, and feed-scoped IDs. Remove Service Alerts from MVP intake pending explicit behavior and terms choices. Keep validator v8.0.1 optional and static only. |
| P2 — Rider view | Retain | Keep twenty stops, two routes, one transfer, read-only use, distinct schedule/realtime labels, no-current-observation state, service date/timezone, and offline labels. Require an explicit trip pair and mapped transfer location before showing a margin. |
| P3 — Transfer interpretation | Correct and condition | Keep the schedule margin and separate timestamped realtime margin. Apply specificity and type rules distinctly; withhold on type 3, ambiguity, unsupported frequency service, unmapped locations, or unusable stop data. Types 4 and 5 remain separate and review-only. |
| P4 — Review and history | Retain with source conditions | Keep seven days, no rider identity, immutable source/input records, and separate saved screen state. Check source terms before public raw retention; hashes alone do not make unavailable content reproducible. |
| P5 — Components and refresh | Retain as undecided with bounded evidence | Keep explicit parser/calculator boundaries, offline behavior, age display, and configurable starting thresholds. Treat the validator only as static preflight. Keep actual feeds, timezone conversion, DST, and runtime parser undecided. |
| P6 — Acceptance | Retain and expand | Keep replacement, absent realtime, identifier, overnight, DST, and stop-count checks. Add the early-drop, frequency, type 1/4/5, cross-feed mapping, stop-sequence/propagation, alert-if-selected, source-retention, and privacy cases. All are proposals. |

## O2 — Component code and version applicability

MobilityData GTFS Validator v8.0.1 is the only component examined in the inherited research. In the pinned ServiceWindow source, ServiceWindow.get iterates service IDs attached to trips, gets each interval using optional calendar tables, skips empty intervals, then returns the earliest first-active date and latest last-active date. ServiceIntervalCache applies weekly calendar service and then SERVICE_ADDED or SERVICE_REMOVED exceptions. This produces an outer service-window envelope, not a daily service lookup. The README describes a static GTFS validator with reports. Keep it optional for operator preflight; no runtime parser is selected. [E5–E10]

## O3 — Issue, fix, regression evidence, and release applicability

Issue #2017 reports inverted service-window bounds in v7.0 and links to PR #2029. The PR was merged as f65221e9908f5db0daa81ab8ce94168a5062151b; its summary describes correcting exception handling when exceptions affect only some services and avoiding assumptions that both calendar tables exist. The v8.0.0 release notes list the service-window fix, and the pinned v8.0.1 source/tests inspected here contain the later implementation. This supports release applicability for validator service-window metadata. Issue #2099 is a separate v7.1.0 report; the captured critic notes show no linked PR on its page. Do not say #2029 fixed #2099 specifically. Source tests were inspected, not executed. No finding here proves the kiosk's transfer logic or realtime behavior. [E6–E15]

## O4 — Alternatives and negative findings

- **OneBusAway as product analogue:** reuse only the separation of schedule/realtime configuration and the quality-review idea. Its full suite and deployment are outside this bounded kiosk plan. [E19]
- **OneBusAway server validator:** reuse only the reviewable-report shape. Do not adopt its deployment, API-key job trigger, or database flow. [E20]
- **Hide negative scheduled arrivals:** reject as a fix for missing realtime. Issue #162 describes the early-drop jump; PR #160 is closed and unmerged; GTFS Realtime PR #16 clarified producer retention. Hiding a confusing schedule value does not create an observation. Do not claim OneBusAway shipped that change. [E16–E18]
- **Vehicle-position dots and crowdsourced reports:** optional future evidence only after separate source-trust, freshness, moderation, privacy, and retention decisions. Neither is part of initial transfer arithmetic.

## O5 — Explicit disposition of every critic finding

1. **Transfer types 1, 4, and 5 — Adopted.** Correct the conflation. Type 1 is a timed relationship with an expected wait but no kiosk promise; type 4 permits in-seat continuation; type 5 requires alighting and re-boarding. Keep 4 and 5 separate and review-only pending implementation. [E1]
2. **Frequency-based service — Adopted.** Withhold fixed scheduled margins for exact_times=0. Treat exact_times=1 as a candidate only after schedule expansion and trip pairing are validated. Add both fixtures. [E1]
3. **Cross-agency join and trip pair — Adopted with unresolved product choice.** Namespace IDs, require either merged-feed semantics or a curated stop/platform crosswalk, and withhold on unmapped/ambiguous locations. Keep trip-pair selection explicit and unresolved; no option is selected without product input. [E1]
4. **Service Alert scope — Adopted by removing it from MVP.** Preserve alerts as a later option only after a bounded match/display/suppression policy. Do not claim they affect the transfer now. [E4]
5. **Validator issue history — Adopted.** State that #2029 is evidenced for #2017 and for the service-window summary calculation in later release source. Keep #2099 separate and unverified as a #2029 fix. Tests inspected, not run. [E6–E15]
6. **Provenance and public-history conditions — Adopted with unresolved terms.** Keep seven days and immutability, but gate raw public retention/replay on actual source terms. If only permitted parsed inputs and hashes can be retained, state replay limits; a hash cannot reproduce missing source content. Keep secrets out of pages and logs.
7. **Targeted realtime joins — Adopted.** Add repeated stop_id/stop_sequence, delay propagation, unusable stop relationship, and trip-level-only cases. Do not present a stop prediction without a usable stop-time value. Leave uncertainty display undecided and make no confidence claim meanwhile. [E2–E3]

No critic finding is rejected. The unresolved points are explicit product or feed-validation decisions rather than facts the supplied source bytes settle.

## O6 — Acceptance state and remaining decisions

The proposed plan is ready for product adjudication, not for a correctness or performance claim. Before a supported margin can be shown, decide: actual agencies/feed URLs and terms/access; merged feed versus curated crosswalk and station/platform mapping; trip-pair selection; default/editable walking allowance; exact_times frequency scope; whether linked types 4/5 will ever be implemented; Service Alert scope if it returns; per-feed freshness thresholds; parser and agency-time/DST conversion policy; target tablet/browser/network and performance threshold; and whether seven-day history contains screens, structured records, or both. Then run the proposed validation against the selected feeds and build. None of those decisions or checks is reported as completed here.

## Evidence and execution boundary

Evidence files cited as E1–E21, including the critic's bounded notes E21 are copied under sources/ with mechanically computed SHA-256 values in source-map.json. Research source-map entries S5 and S14 are preserved as predecessor references because those source bytes were not needed for a changed consequential claim in this revision. No additional public discovery was performed. No real agency feeds, builds, app tests, validator executions, source terms, target hardware, or performance results were inspected.
