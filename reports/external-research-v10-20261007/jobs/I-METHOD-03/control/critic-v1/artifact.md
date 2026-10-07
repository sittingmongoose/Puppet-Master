# I-METHOD-03 control/critic-v1 — independent critique

**Status:** Complete candidate critique of the researcher draft, not a replacement plan. I read only the input-map, original brief, frozen plan, researcher artifact, and researcher source map, then checked public primary sources. I did not inspect other campaign/case material. This is a fresh candidate critic, not an independent Sol evaluator.

## Overall assessment

The draft is substantial and mostly well grounded. Preserve its central safety model: keep schedule and current observations separate; a missing or stale RT record is not “on time”; show acquisition age and source identity; retain an immutable provenance trail; keep the kiosk read-only; and preserve the brief’s no-dispatch, no-occupancy, and no-accessibility-availability limits. Its early-arrival example and its rejection of hiding a confusing scheduled value are supported by the GTFS Realtime specification and public OneBusAway history [C2, C6].

The main scientific correction is the draft’s compression of distinct GTFS transfer types. There are also unclosed scope choices around frequency-based service, cross-agency stop identity, alerts, and trip-pair selection. These should remain visible in finalization rather than being quietly resolved as technical defaults.

## Material corrections and unresolved objections

1. **Separate transfer types 1, 4, and 5.** GTFS Schedule type 1 is a timed transfer whose departing vehicle is expected to wait; the kiosk must still avoid promising that it will. Type 4 is an in-seat transfer. Type 5 explicitly disallows an in-seat transfer and requires the passenger to alight and re-board. The draft’s “linked/in-seat types 4/5” shorthand is inaccurate. Retain a review-only/unsupported policy if desired, but label type 4 and type 5 separately, explain the timed-transfer annotation without a guarantee, and test all three semantics independently [C1].

2. **Bound the arithmetic to supported service.** GTFS permits headway-based service in frequencies.txt with exact_times=0, which has no fixed schedule, as well as compressed fixed-schedule service with exact_times=1. The draft’s scheduled-margin formula and “upcoming departures” language assume fixed trip times. Before showing a computed margin, either support each admitted frequency case or reject/withhold the calculation for unsupported cases with a clear state. Add fixtures for exact_times=0 and exact_times=1 [C1].

3. **Define the two-agency transfer join.** Per-feed ID namespaces are correct, but if the agencies publish separate feeds, GTFS stop/route/trip IDs and transfers.txt rules do not themselves identify the same physical transfer location across feeds. The draft needs an explicit product decision for a curated stop/platform crosswalk or a single merged feed, plus a failure state for unmapped or ambiguous stops. Also define how the one transfer view chooses/ pairs trips and handles station-versus-platform stops; “selected arriving and departing trips” currently leaves this product behavior open [C1].

4. **Choose a Service Alert scope.** P1 adds Service Alerts, freshness thresholds are discussed in P5, but no rider or volunteer behavior says whether an alert affects the selected stop, route, trip, or transfer. Either define a small supported alert subset and its display/suppression rules, or remove Alerts from the MVP intake claim. Do not let an imported alert silently imply that the transfer calculation has incorporated it.

5. **Narrow the validator history claim.** The code review is useful and the version boundary is sound: in v8.0.1, ServiceWindow.get aggregates the earliest and latest active dates across trip service_ids using ServiceIntervalCache; it does not select transfer trips or prove continuous service across the whole interval. The service-window issue #2017 links to fix PR #2029; the separate #2099 report has no linked PR on its page. State that #2029 is the fix evidenced for the #2017 defect and that v8.0.0 release notes plus v8.0.1 source/tests establish later release applicability to this summary calculation. Do not imply #2099 itself was linked to or individually verified as fixed by #2029. Tests were inspected, not run. Keep this validator as optional static-feed preflight only, never as a runtime parser, realtime decoder, or proof of an active service day [C3–C5].

6. **Tighten provenance and public-history conditions.** The frozen plan’s seven-day public history is retained, but the draft proposes keeping full schedule/RT snapshots or archive references. Availability at a public URL alone does not establish permission to republish a feed or its history. Add a decision/precondition for source terms and retention; if raw feed replay cannot be publicly retained, preserve permitted parsed inputs and hashes and make the limitation explicit. Keep full credentials and secret query values out of public pages and logs, not merely out of a visible URL [C1, C7].

7. **Add targeted RT join tests.** The current proposal covers absent, stale, skipped, cancelled, NO_DATA, and mismatched cases. Add repeated stop_id visits resolved with stop_sequence, delay propagation through omitted StopTimeUpdates, and a trip update whose stop relationship means the requested stop has no usable timing. A matching trip-level update alone must not be treated as a direct stop prediction. State whether optional uncertainty supplied by a feed is displayed; otherwise avoid implying a confidence level [C2].

## Comparison with every frozen plan decision

| Frozen plan | Critic disposition |
|---|---|
| **P1 Feed intake** | Retain user-selected public schedule feeds, optional RT, source identity, acquisition times, immutable versions, and explicit failure states. Decide whether Service Alerts are actually supported. Preserve the namespace isolation, but add a cross-feed stop mapping decision for an inter-agency transfer. Add feed terms/republication as a condition for public raw history. |
| **P2 Rider view** | Retain twenty stops, a single two-route view, visible schedule/RT distinction, “no current observation,” service date/timezone, and offline labels. Specify how the kiosk selects the arriving/departing trip pair and how unsupported frequency-based service is represented. |
| **P3 Transfer interpretation** | Keep separate schedule and RT margins and the no-connection-guarantee notice. Correct type 1/4/5 language; preserve transfer rule specificity and prohibited-transfer handling. Define ambiguous maximal-rule failure, frequency-service eligibility, and cross-feed location matching before presenting a margin. Do not imply a type 1 timed transfer is an ordinary schedule-only relationship. |
| **P4 Review and history** | Keep seven days, no rider identities, immutable source/input records, and separate saved screen state. Add the public-retention/terms decision and credential/log handling. Hashes alone do not let a volunteer reproduce content if no permitted archive or structured input remains. |
| **P5 Components and refresh** | Keep parser/calculator undecided and validator v8.0.1 as an optional static preflight candidate only. Preserve the distinction between a service-window envelope and active service dates. Keep RT age values as configurable starting thresholds from recommendations, not guarantees. Time conversion and feed-specific conventions remain unresolved until real feeds are examined. |
| **P6 Acceptance** | Retain all named plan cases and proposed-only status. Add exact_times frequency fixtures, cross-feed mapping ambiguity, types 1/4/5, alert behavior if retained, rule ties, repeated stop IDs/stop_sequence, propagation and source-retention checks. Performance remains unvalidated until the tablet/network and threshold are selected. |

## Dispositions to carry into finalization

**Supported to preserve:** provenance/replayability; immutable schedule and observation records; schedule-versus-RT labels; absence and staleness as different states; no inference of “on time”; the early-stop-drop case; and a scoped static validator preflight [C2–C5].

**Already covered by the frozen plan:** read-only kiosk and bounded two-agency/one-transfer scope; twenty-stop limit; schedule/RT distinction; absent observations not confirmed departures; seven-day history without rider identity; tablet/offline behavior; operator-readable error state; and the original exclusions for occupancy, accessibility availability, and dispatch. Keep those exact constraints rather than treating them as new research discoveries.

**Rejected lead:** “Hide negative scheduled arrivals” is not a solution to missing RT data. OneBusAway issue #162 describes the ETA jump; PR #160 is closed and unmerged; the GTFS Realtime clarification PR #16 is merged and the current pinned Trip Updates text describes the early-arrival retention case [C2, C6].

**Optional, not MVP:** Vehicle-position display or crowdsourced observations only after separate trust, freshness, moderation, privacy, and retention choices. The draft correctly says a position is not a prediction.

**Unresolved product decisions:** agency/feed URLs and terms; single merged feed versus a stop crosswalk; walking allowance; supported frequency service; alert scope; trip-pair selection; linked-trip handling; feed-specific age thresholds; service-time conversion and DST policy; tablet/browser/network and performance threshold; public raw-source retention; and whether saved screens or only structured records count toward history.

## Validation status and boundary

The researcher’s proposed tests are useful proposals, not executed checks. I inspected public source and test text only; I did not build, execute the validator, run tests, fetch agency feeds, or claim application correctness. One provenance concern needs coordinator adjudication: the researcher draft’s execution record says it also read “dispatch configuration” and “INPUTS.md,” while the supplied input-map boundary admits the brief, plan, and researcher artifact/source-map. I did not open those extra files. Preserve this self-reported discrepancy in the arm record rather than certifying the researcher’s exact-input boundary as clean.

The cited source paths, versions, operation counts, and limits are in the linked source map.
