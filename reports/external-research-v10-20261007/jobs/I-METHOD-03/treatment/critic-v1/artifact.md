# I-METHOD-03 — critic-v1 review of research-v1

**Status:** Fresh candidate critic; this is a critique and disposition record, not a replacement plan or implementation report.

## Overall assessment

The research-stage draft is a strong, unusually complete basis for the proposed kiosk. Keep its central safety boundary, schedule-versus-estimate distinction, feed/version traceability, bounded transfer arithmetic, seven-day history, explicit local-data uncertainty, and proposed validation suite. Its P1–P6 comparison is visible and covers the frozen scope.

I would not carry three statements forward unchanged: the claim that FeedHeader.timestamp is required, the unresolved arithmetic between a mapped walking allowance and GTFS min_transfer_time, and the use of a VehiclePosition matcher/history case as evidence for the proposed TripUpdate path. A fourth gap is alert applicability: freshness alone does not establish that an alert applies now to this selected stop or trip. These are bounded corrections; they do not overturn the MVP direction.

## Dispositions

### Preserve — supported findings

- Keep the rule that no TripUpdate means no prediction information, not “on time.” The pinned GTFS Realtime proto says exactly that for TripUpdate (E02, TripUpdate message); it also distinguishes omitted uncertainty from uncertainty zero. Keep the draft’s plan to test both cases.
- Keep FULL_DATASET as the first-release contract. The pinned proto defaults absent FeedHeader.incrementality to FULL_DATASET and calls DIFFERENTIAL unsupported with unspecified behavior (E02, FeedHeader). Explicitly reject DIFFERENTIAL instead of merging it into retained state.
- Keep the interpretation of GTFS service-day times, times beyond 24:00, and agency timezone. Keep separate Schedule and Realtime versions, feed-scoped identifiers, stop-sequence handling for repeated stops, cached/offline labels, and fail-closed behavior for unmatched or unsupported data.
- Keep the Schedule transfer semantics in P3: transfer_type 2 requires min_transfer_time; type 3 prohibits the connection; type 1 is an expected-to-wait timed transfer but not a guarantee. The pinned Schedule reference supports these distinctions (E01, transfers.txt). The draft appropriately declines promises, probabilities, accessibility claims, occupancy claims, and dispatch coordination.
- Keep the local-data caveats. No agency, endpoint, timezone, stop pair, tablet, or feed quality is known from the brief. The 90-second TripUpdate and 10-minute alert cutoffs are proposed thresholds based on GTFS best-practice recommendations, not measured local reliability (E03, general practices).
- Keep OTP as an optional growth comparator and the GTFS Validator as a preflight candidate. The draft correctly says that neither a documentation page nor an open validator issue proves a performance fit or a shipped defect.

### Correct before finalizing

**C1 — FeedHeader timestamp is optional in the pinned schema.**  
P1 currently says a “missing required FeedHeader.timestamp” invalidates the freshness claim. In the pinned proto, the field is optional uint64 timestamp (E02, lines 71–74). GTFS best practices say it should not decrease and should change when feed contents change, but those are producer recommendations; the proto does not make its presence required. Keep a fail-closed product policy if desired, but label it as this MVP’s policy: “If the header timestamp is absent, do not assert publisher-time freshness; show age from fetch separately and suppress the estimate or mark its freshness unknown.” Do not call the field required by the specification.

Also make the freshness decision explicitly distinguish fetch time, FeedHeader timestamp, and a TripUpdate’s own timestamp. The proto makes TripUpdate.timestamp optional, and best practices say it should reflect when that trip prediction was updated (E02 TripUpdate; E03 TripUpdate timestamp row). A fresh header does not prove an old per-trip prediction is fresh. The proposed 90-second cutoff should state which timestamp is compared, what happens when it is absent, and which stale object is suppressed. The current draft partly anticipates this in P4 but does not bind it to P1/P2 behavior. A decreasing header timestamp can remain a conservative invalidation rule; note that this is a consumer policy grounded in a SHOULD recommendation, and account for the load-balancer inconsistency described in E03.

**C2 — Define one connection threshold; avoid silently adding duplicate buffers.**  
P3 compares available time with the mapped walking allowance plus buffer, then says to apply a type-2 transfer’s min_transfer_time. The Schedule reference describes min_transfer_time as the time required for a transfer and says it should cover a typical rider’s movement plus schedule-variance buffer (E01, transfers.txt). The draft does not say whether the type-2 minimum replaces, raises, or is added to the mapped walk/buffer. Addition can count the same movement/buffer twice and reject connections unexpectedly. State the meaning of each input and define one formula. A conservative candidate is to use the greater of the independently reviewed walk-plus-buffer and the applicable Schedule minimum where both represent total minimum connection time; if local policy intends additive components, justify and test that meaning. Add missing-min_transfer_time with type 2 as an application-side rejection test; do not rely on the validator.

**C3 — OTP code evidence is real but narrower than the selected mechanism.**  
The pinned OTP v2.10.0 RealtimeVehiclePatternMatcher uses a FeedScopedId and infers a missing service date for a VehiclePosition; PollingVehiclePositionUpdater is its caller (E04, lines 149–213 and 345–385; copied caller in sources/). The issue/fix chain is concrete: issue #4058 reports undated VehiclePositions being discarded; at the reporter’s stated deployed commit b0c9829e3bfe10daddae72485a09a7f48b0be8ff, the matcher returns when start_date is absent (E07, lines 116–129). PR #4066 adds inference and regression cases; the release comparison identifies its merge as an ancestor of v2.2.0, whose matcher/tests and v2.10.0 code show the behavior in later releases (E05–E06 and copied v2.2.0 release/code/test captures). This supports the bounded history claim. It does not establish test execution, DST correctness, or any local feed property.

My substantive objection is applicability: this is VehiclePosition matching, while the MVP explicitly excludes VehiclePositions as prediction inputs and selects matched TripUpdates. Its value is a negative lesson—do not guess missing trip identity/date and do not equate positions with predictions—not evidence that the proposed TripUpdate matching/calculator is validated. “A bounded GTFS reader and deterministic calculator” remains a category, not a pinned component/version. Either name and inspect the actual candidate implementation with a governing definition/caller and applicable history, or keep implementation selection explicitly unresolved and do not present OTP’s VehiclePosition history as satisfying the selected TripUpdate component’s code obligation. Do not expand scope to OTP solely to resolve this.

### Add or clarify within the frozen scope

**P1.** Keep feed-version comparison conditional on both declarations being available; missing feed_version is unknown, not a match or mismatch. Distinguish atomic Schedule activation from Realtime fetch failure. The proposed backoff and publisher-limit policy is appropriate but needs actual endpoints and terms before deployment.

**P2.** The cancellation/alert promise needs matching and time rules. A fresh alert is not necessarily active or relevant. Before showing one, require its active period (or a stated policy for absent periods) and a matching informed_entity selector for the configured route, trip, stop/station, or agency, and test both start/end boundaries and an expired alert still present in the feed. Define how the first release treats experimental TripDescriptor.DELETED separately from CANCELED; do not imply every consumer should display it identically. The pinned Realtime reference and proto are the governing sources (copied reference; E02/E03).

**P3.** Preserve the explicit reviewed stop-pair mapping; a shared/coincident stop ID is not enough across feeds. Add the threshold precedence test from C2. Do not infer a type-4/5 linked-trip transfer across agencies; the cited Schedule rule says linked trips use the same vehicle (E01, linked trips). The draft’s “no in-seat inference” is conservative and supported.

**P4.** Preserve reproducible source/version/time/mapping evidence and the public-summary versus volunteer-detail distinction. Confirm the retention/access policy for vehicle identifiers before actual feed retention. The brief asks volunteers to review whether displayed advice came from schedules or current observations; a screenshot comparison alone would not satisfy that need, so retain the underlying versioned inputs as proposed.

**P5.** The small parser/calculator/view is a sensible scope choice and no full routing engine is justified by this brief. But retain the component decision as open until a specific implementation boundary is stated. Discovery has useful negative evidence: OTP is a broader routing platform, the inspected matcher is not a TripUpdate predictor, and a validator is not proof of the application’s transfer semantics. If the final keeps custom bounded logic, record that as an intentional build decision, not as an evaluated named component.

**P6.** Keep the proposed tests and mark them proposed, not executed. Add the cases for freshness-field precedence, active/expired/unmatched alerts, type-2 threshold combination and missing required minimum, a full-dataset entity disappearing, and the DELETED policy. Keep performance thresholds explicitly proposed pending the named device, feeds and network. The research executed no application build, feed check, validator run, or performance measurement; the artifact states this accurately.

## Complete plan comparison and finalizer handoff

| Frozen decision | Critic disposition |
|---|---|
| P1 feed intake | Keep, with C1 freshness correction and conditional feed-version interpretation. |
| P2 rider view | Keep schedule/estimate/unknown/cached states; add C1 timestamp semantics and alert applicability. |
| P3 transfer interpretation | Keep the narrow mapped transfer and no-promise boundary; resolve C2 threshold formula and add its tests. |
| P4 review/history | Keep replayable evidence and seven-day proposal; confirm vehicle-ID retention/access policy. |
| P5 components/refresh | Keep bounded architecture and OTP as optional growth path; resolve or explicitly leave the actual parser/calculator selection open under C3. |
| P6 acceptance | Keep the expanded proposed suite; add the cases above and preserve “not executed” status. |

**Agreement:** The proposed MVP direction is supportable, and the evidence cited for GTFS semantics and the OTP VehiclePosition regression is materially useful.  
**Disagreement:** I do not accept “missing required FeedHeader.timestamp” as a specification fact, nor OTP VehiclePosition behavior as proof of the selected TripUpdate path.  
**Unresolved:** The local feeds, freshness policy for missing per-trip timestamps, alert matching policy for absent active periods, transfer-threshold composition, vehicle-ID retention, and concrete implementation choice require a product or implementation decision. The final reviser should preserve these objections and their disposition rather than silently resolving them.

## Evidence and execution boundary

Independent primary-source checks were made against pinned GTFS Schedule and GTFS Realtime sources and OTP commit/release history. Captures are linked in source-map.json and sources/. No tests, build, validator, live agency feed, performance run, or application behavior check was executed. This critique does not validate local data quality or claim the application was built.

