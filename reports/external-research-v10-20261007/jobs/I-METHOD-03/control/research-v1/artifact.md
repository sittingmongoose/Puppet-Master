# I-METHOD-03 — proposed revision: transit transfer review kiosk

**Status:** complete researcher draft for this arm. Independent discovery preceded the frozen-plan review. The fresh same-family critic has not run; O5 is pending and no criticism or disposition is invented here. This artifact is the proposed product plan, not a build report.

## Recommendation

Keep the small read-only scope: two agency feeds, twenty selected stops, and one selected two-route transfer view. Make the unit of advice a dated, source-linked comparison between a scheduled transfer and an optional current observation. Store enough immutable input evidence to let a volunteer reproduce the displayed comparison. Keep absence, staleness, identifier mismatch, and fetch failure as distinct states. Never infer “on time,” promise that a vehicle will wait, or imply dispatch coordination from a missing or stale feed.

The public GTFS guidance says a trip with no TripUpdate has no realtime data and must not be treated as on time. It also explains the early-arrival failure where a producer drops a passed stop before its scheduled arrival, causing a consumer to fall back to schedule. [S3] The current best-practice document recommends retaining that update until scheduled time has passed, and advises fresh polling and age checks. [S4] OneBusAway’s public issue #162 records the rider-facing ETA jump; its related consumer-side PR #160 was closed without merge and did not solve the early-arrival case. The merged GTFS Realtime change was a producer-spec clarification in PR #16. Do not claim a shipped OneBusAway application fix. [S11–S13]

## Proposed replacement sandbox plan

### P1 — Feed intake and identity

Import operator-selected, public GTFS Schedule archives and, where published, GTFS Realtime TripUpdate and Service Alert feeds. Keep the feed URL (with credentials and secret query values redacted from review output), feed/operator identity, agency identity, acquisition time, the archive or response hash, declared feed version/effective period, parser version, and validation status with every imported snapshot. Treat each agency/feed as its own identifier namespace: keys are `(feed_id, agency_id, entity_id)`, never bare `trip_id`, `route_id`, or `stop_id` across feeds. Replacing a schedule creates a new immutable snapshot; it must not rewrite the evidence behind an earlier displayed transfer.

Poll RT feeds server-side at an operator-selected interval. Record fetch time separately from `FeedHeader.timestamp` and the relevant TripUpdate timestamp. Do not use a refreshed header to mask an old entity timestamp. If a field needed to establish freshness is absent, label freshness unknown. A VehiclePosition may be archived as an observation, but it is not an arrival prediction without a separately validated prediction method.

Use the MobilityData GTFS Validator v8.0.1 as an optional static-feed preflight and a source of operator-readable findings, not as the runtime schedule parser, RT decoder, trip planner, or transfer calculator. Its README describes a static GTFS validator and browser-readable HTML/JSON reports. [S7] Confirm that any chosen runtime parser and the two actual agency feeds handle the admitted GTFS features before adopting them.

### P2 — Rider view

Preserve the plan’s twenty selected stops and one selected transfer between two selected routes. Show stop, route, direction/headsign where available, service date, agency-local displayed time, schedule snapshot date, and a clear source badge for each time. The kiosk is read-only for riders; no account, rider identifier, or trip history is needed. An operator page may identify feed status and parser errors without making users interpret raw protobuf or CSV.

The view remains useful with no current RT feed: it shows schedule-based departures with an acquisition/effective-date label and a separate “no current observation” state. If the service day is outside the schedule’s stated active period, do not silently continue serving it as a current schedule.

### P3 — Transfer interpretation and limits

For the selected arriving and departing trips, calculate and display the scheduled arrival, scheduled departure, transfer allowance, and **scheduled transfer margin** in seconds/minutes:

`scheduled margin = outgoing scheduled departure − incoming scheduled arrival − applicable transfer allowance`.

Treat `transfers.txt` as a specific transfer constraint/override when its stop, route, and trip keys apply. Resolve the most-specific applicable rule; do not replace a forbidden (`transfer_type=3`) transfer with a generic walking-time assumption. For type 2, use the required `min_transfer_time`; for a rider-configured walking allowance, use the more conservative of that allowance and an applicable minimum. Type 1 is a scheduled timed-transfer relationship, not a promise that a bus will wait. Keep linked/in-seat transfer types 4/5 out of the initial computed-transfer display; label them as unsupported/review-only until their trip-link semantics are implemented. The GTFS reference defines these cases and specificity ordering. [S1]

When a matching, sufficiently current TripUpdate has a stop-time prediction for the selected trip/stop, show a separate **observed/predicted margin as of [timestamp]** using the same transfer allowance. Do not blend schedule and RT values into an unexplained single time. For a cancellation, skipped stop, reroute, stale entity, absent TripUpdate, unknown timestamp, or mismatched trip/stop identifier, show the relevant state and withhold the derived RT margin. GTFS-RT `NO_DATA` means no RT timing information; it is not zero delay. [S2–S3]

Put a short, persistent notice beside the transfer: “Times are based on the named schedule and, when shown, a timestamped agency observation. A displayed margin does not confirm that a connection will be made.” Keep the original brief’s exclusions: no vehicle occupancy, accessibility availability, or dispatch action/coordination claims.

### P4 — Volunteer review and seven-day history

For each displayed state, save an immutable evidence record sufficient to reproduce it: schedule snapshot identity/hash and effective dates; RT response identity/hash, acquisition time, header/entity timestamp and entity IDs used; service date and agency timezone; selected route/trip/stop identifiers in their feed namespaces; applicable transfer rule and walking allowance; parser/calculator version; source status; and derived schedule/RT values with the reason for any withheld value. Preserve the relevant parsed rows and the original schedule/RT snapshot (or an auditable archive reference) so volunteers can inspect the actual inputs. Save the rendered kiosk state separately from the source data. A later observation appends a new record and comparison; it never edits the saved display.

Expire public history after seven days. Do not collect rider identity, device identity, precise user location, or a user journey. Strip credentials from visible provenance and logs. The useful analogy is OneBusAway’s server validator: it cross-checks a service’s API against authoritative schedule and RT feeds and creates a structured report with a verdict, counts, and per-source groups. Reuse the reviewable-evidence pattern; do not adopt its server deployment, API-key job trigger, or database workflow as a requirement for this kiosk. [S14]

### P5 — Components, time, refresh, and offline behavior

Keep parser, timestamp interpretation, and limited transfer calculation as explicit, versioned components behind small interfaces. Candidate component evidence: the released MobilityData validator v8.0.1 service-window implementation is a useful example for offline schedule-feed quality checking only. Its `ServiceWindow.get` takes trips plus optional `calendar.txt` and `calendar_dates.txt`, obtains active intervals by `service_id`, and summarizes the earliest/latest dates; its cache combines weekly calendar service with added/removed dates. [S8–S10] It does not choose a trip for a transfer or validate GTFS-RT. A runtime parser remains a product/engineering selection after compatibility checks against the exact feeds; no parser library is selected by this research.

Interpret schedule times as service-day values in the agency timezone, not as the kiosk machine’s local time or a stop’s display timezone. GTFS permits service times greater than 24:00 and defines the service-time origin as “noon minus 12h,” which differs from ordinary midnight on daylight-saving transition days. For each agency, convert from its own schedule service day and `agency_timezone`; only then compare absolute instants across feeds. Keep the original text/service date alongside the converted instant for audit. Test both spring and fall clock changes. The spec’s exact fold/gap behavior and the agencies’ publishing conventions need feed-specific validation before finalizing the conversion library. [S1]

For TripUpdates and VehiclePositions, begin with the GTFS Realtime best-practice recommendation of no more than 90 seconds of source-data age; for Service Alerts, begin with 10 minutes. The recommended refresh cadence is at least every 30 seconds. These are producer recommendations and starting alert thresholds, not guarantees of prediction quality or service correctness. Make thresholds configurable per feed, display actual ages, and distinguish `fresh`, `stale`, `unknown age`, `missing observation`, and `fetch/parse error`. [S4]

On intermittent connectivity, keep the last schedule snapshot available with its effective period and acquisition time. Continue showing a historical RT observation only with its original timestamp and a clear offline/stale state; never label it current. Operator errors should identify the failed feed and last successful acquisition. Tablet layout and cache behavior should be verified on the agreed target device.

### P6 — Proposed validation and acceptance

No application build or test was run for this research. The following checks are proposals, not executed results:

1. **Feed replacement/provenance:** import schedule snapshot A, display and save a transfer, replace with B; the original saved record still reproduces A and the new view cites B. The source namespace prevents a repeated bare trip or stop ID in the second agency from joining the wrong record.
2. **Unknown and stale RT:** with no TripUpdate, display the scheduled time plus “no current observation”; never say on time. Repeat with stale header, fresh header but stale entity, missing timestamp, fetch error, parse error, `NO_DATA`, cancellation, skipped stop, and mismatched IDs; each yields the specified distinct state and no unsupported RT margin.
3. **Early-arrival regression:** fixture: scheduled Stop 4 at 10:20, observed prediction 10:18, and the producer drops the past stop update at 10:18. Verify the system records “no RT information for this stop” and uses schedule only as schedule, without ETA bounce or false realtime label. Also verify that a retained update remains attributed to its original timestamp.
4. **Transfer rules and arithmetic:** verify scheduled margin at positive, zero, and negative values; configured walking allowance; most-specific route/trip transfer; type 2 minimum; forbidden type 3; and review-only behavior for linked/in-seat types 4/5. Cover two separate agencies with colliding IDs and different time zones.
5. **Service date/calendar:** use `calendar.txt` weekday boundaries, `calendar_dates.txt` additions/removals, calendar-only, dates-only, both tables, and no active trip; assert that only active service dates feed the calculation. Run the pinned upstream validator as a preflight and retain its versioned report.
6. **Overnight and DST:** service time `25:35:00` resolves on the following civil day while retaining the original service date; spring-forward and fall-back fixtures are interpreted in the correct agency timezone and remain reproducible from saved source rows.
7. **History/privacy/offline:** source records and screen state remain distinct and immutable; public history is available for seven days then expires; no rider/device identity is persisted; offline mode shows last acquisition and marks RT stale/offline.
8. **Performance:** benchmark the selected twenty stops and one transfer on the agreed target tablet using both warm cache and fresh refresh. Record p50/p95, payload sizes, and source-fetch latency separately. Choose an acceptance limit only after the group names the device/network and refresh load; no performance claim is currently supported.

## Comparison against every frozen plan decision

| Frozen decision | Disposition | Exact change/retained scope |
|---|---|---|
| **P1 — Feed intake** | Retain with corrections | Keep user-selected public GTFS plus optional agency RT. Add immutable schedule/RT snapshots, acquisition time distinct from source timestamps, per-feed ID namespaces, effective period, source hashes, and explicit feed errors. Do not infer RT freshness from a refreshed header alone. [S1–S4] |
| **P2 — Rider view** | Retain | Keep twenty stops, two selected routes, one transfer, visible schedule/RT distinction, and “unavailable is not confirmed.” Clarify exact source badge, service date, agency timezone, and offline state. [S2–S4] |
| **P3 — Transfer interpretation** | Necessary correction and supported addition | Retain scheduled arrival/departure and walking allowance. Add transfer-specific GTFS rule precedence and margin arithmetic. Add a separately timestamped RT overlay only for an identified trip/stop. Keep no occupancy, accessibility availability, or dispatch promises. [S1–S4] |
| **P4 — Review and history** | Supported addition | Retain seven days/no rider identities and saved screen comparison. Define immutable, replayable source/input records and append-only later observations; separate screen snapshot from feed evidence. [S14] |
| **P5 — Components and refresh** | Retain as undecided with candidate evidence | Retain tablet/offline use, explicit age, operator error, and undecided runtime parser/calculator. Add GTFS service-day/DST semantics and separate stale/unknown/missing states. Recommend validator v8.0.1 for offline static preflight only. [S1, S4, S7–S10] |
| **P6 — Acceptance** | Retain and expand | Keep feed replacement, absent RT, inconsistent identifiers, overnight, DST, and stated stop count. Add early-drop, stale entity despite fresh header, transfer-rule specificity, cross-agency ID collisions, calendar exceptions, cancellation/skipped/`NO_DATA`, history/privacy, and source-status displays. Proposed tests only. [S1–S4, S8–S10] |

## Component code and version applicability (O2)

The consequential candidate examined was MobilityData’s public static GTFS Validator release **v8.0.1**, tag commit `d74d7177f9f7c6bc7adc69508bb939362f2cf770`. In `ServiceWindow.java`, `ServiceWindow.get(...)` loops over service IDs that have trips, calls `ServiceIntervalCache.getIntervals(...)` with the optional calendar/calendar-dates tables, skips empty intervals, and selects the first/last active dates. The cache builds weekly calendar ranges and then applies `SERVICE_ADDED`/`SERVICE_REMOVED` entries; `ServiceInterval` merges/splits date intervals and exposes first/last active dates. `ServiceWindowTest` exercises calendar-only, dates-only, both-table, removed-boundary, and empty-service cases. These definitions and callers show the behavior is a feed-wide report summary, not a transfer trip selector. [S8–S10]

That makes the validator a bounded candidate for operator preflight and feed-version review. Its own README identifies it as a **static GTFS Schedule** validator; do not use it to decode RT or claim a computed transfer is sound. The research did not build the validator, run its tests, or validate either real agency feed. [S7]

## Issue → fix → regression evidence → release applicability (O3)

MobilityData issue #2017 reported v7.0 validation reports whose service-window start followed the end even though there was no range-order notice. It was linked to PR #2029. A second report, issue #2099, reproduced a wrong window from v7.1.0 on a VBB feed: the reported interval was `2026-07-18` to `2026-02-11`, while the report author calculated the feed’s active dates as `2026-02-12` through `2026-12-12`. [S15–S17]

PR #2029 was merged on 2026-03-05 as `f65221e9908f5db0daa81ab8ce94168a5062151b`. Its summary describes fixing exception handling when calendar-date exceptions affect only some services and avoiding computation as though both tables existed when one or both was absent. Its resulting tests in the pinned v8.0.1 source cover optional-table paths and service dates shifting when all services are removed from a boundary; the lower-level interval tests cover date addition/removal, gap merging/splitting, and empty intervals. The v8.0.0 release notes list the service-window calculation fix and link #2029; v8.0.1 is a later signed release whose pinned source contains the implementation/tests examined here. This establishes release applicability for **validator service-window metadata**. It does not establish transfer correctness or realtime freshness. No test was executed in this research arm; inspected test source and a published release are the witness. [S8–S10, S16, S18–S19]

## Alternatives, negative findings, and decisions still needed

- **OneBusAway as a product analogue:** its v2.7.1 setup configures static GTFS separately from TripUpdates, VehiclePositions and Alerts, and recommends arrival-time quality control. It is a mature rider-information suite, but its full server, deployment and data-quality program exceed this two-agency kiosk. Borrow the explicit feed/provenance and quality-review pattern; do not adopt the whole platform as an MVP requirement. [S5]
- **OneBusAway server-validator as an assurance analogue:** it cross-checks API results against source feeds and separates a verdict/report from execution success. Use that reviewable evidence shape; its external deployment and keyed job workflow are not needed. [S14]
- **Rejected “hide the confusing time” fix:** OBA PR #160 was closed unmerged and added an option to hide negative scheduled arrivals. The linked issue describes a different, still problematic early-arrival drop case; hiding a value cannot create a current observation. The merged GTFS-RT PR #16 clarified producer retention expectations, and the current pinned spec still treats a dropped update as no RT information. The kiosk should preserve that distinction instead of copying the unmerged patch. [S11–S13]
- **Optional, out of MVP:** Vehicle position dots or crowdsourced reports could become an extra evidence type only after a separate source-trust, freshness, privacy, and moderation decision. A raw location is not a prediction and a volunteer comment is not an agency observation; neither changes the initial transfer arithmetic.

Product decisions still required: the actual agencies/feed URLs and their terms/availability; whether both schedule and RT feeds may require authentication; default and editable walking allowance; timezone/conversion library and DST fold policy; whether linked transfers 4/5 are ever needed; per-feed freshness thresholds; exact tablet/browser and network for performance acceptance; and whether screen snapshots or only structured records count toward the seven-day public history.

## O5 — candidate critic

**Pending fresh same-family critic.** No candidate critique was supplied to or received by this researcher. This section must be populated with the critic’s actual findings and dispositions during finalization; none are fabricated here.

## Evidence boundary and execution record

Sources are public primary GTFS specification/repository material and public component source/issues/releases only. The only local case inputs read were the specified brief, input map/dispatch configuration, `INPUTS.md`, and frozen `plan.md`. Discovery began from the brief before opening the plan. No other case/arm, campaign packet, prior findings, evaluator material, or supplied critique was consulted. No app/repository files were changed. No code was installed or executed, no test/build was run, and no real feed was fetched.

- First useful saved finding: **2026-10-07T19:22:31Z**.
- Complete researcher deliverable saved: **by 2026-10-07T19:39:00Z** (artifact and source map; source-map entries contain per-source access times).
- Discovery operations: **7** web-search batches (**28** query strings); **8** open/find batches (**32** page operations, including **5** internal-error reads); **5** public Git ref lookups; **26** HTTP source-capture attempts (**24** successful public captures (**22** retained source files after two unused captures were deleted), with one initial `gtfs.org` 403 and one corrected-path 404); no source cache was read.
- Immediately after activation the Goal snapshot showed `tokensUsed=0`, `status=active`, identity `01a117cf-4441-7df1-8766-4d75ff67bc8e`. Pre-terminal snapshot at **2026-10-07T19:39:01Z** confirmed the same identity active with aggregate `tokensUsed=330519` and `timeUsedSeconds=1080`; `remainingTokens=null`. These are Goal/session counters, not researcher-arm counters. Input/cache/generated/reasoning/billing-specific and arm-attributable counters are not exposed and remain `null`.
