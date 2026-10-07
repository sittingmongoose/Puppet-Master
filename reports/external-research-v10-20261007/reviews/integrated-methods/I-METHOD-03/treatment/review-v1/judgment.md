# Independent semantic review — I-METHOD-03

**Source judgment: FAIL. Full declared scope assessed.**

The final is a coherent replacement plan with useful discovery, a real versioned code/history investigation, visible criticism dispositions, and careful limits on unexecuted validation. It nevertheless contains three material defects: an incorrect correction of the GTFS Realtime timestamp requirement, a conflicting fallback contract for known non-service, and omitted Schedule boarding/alighting eligibility. These are defects in the proposed contract and its evidence interpretation; no application failure was reproduced.

**Coverage:** 6/6 axes; 6/6 original O obligations; 31/31 atomic frozen-plan clauses across all six P decisions; 15/15 owner decisions; 25/25 consequential check groups; 9/9 criticism dispositions. The obligation universe is **52 total, 52 assessment-complete, 52 assessed, 0 unassessed**. “Complete” denotes completion of this review, not satisfaction of every requirement. Material error count: **3**, identified as D1–D3 below. No early-stop or localized-check grade is being issued.

The exact atomic map and outcomes are in [coverage.json](coverage.json). Every consequential group, its conditions, final locations, and source ranges are in [source-checks.json](source-checks.json). No exhaustive opportunity recall is claimed.

## Inputs, evidence boundary, and blinding

Only the complete supplied `cases/I-METHOD-03/brief.md` and `plan.md`, and this arm’s full `research-v1`, `critic-v1`, and `reviser-v1` artifacts, scientific source-map entries, and linked captures were admitted. No other arm, case, review, parent history, campaign state, selection, lock, or evaluator answer was inspected. Paths in this report are relative to those admitted case/job directories where explicitly identified. The assessed final is:

`/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/jobs/I-METHOD-03/treatment/reviser-v1/artifact.md`

Its SHA-256 is `145b7bd3197a8766097e3d7c23e40567b64383551bfa52246193e2eebc959f76`. That digest identifies the reviewed bytes; it is not a correctness witness.

The paths visibly reveal the arm. Authored text and the initial source-map output also exposed procedure/Goal references and some timing/counter material. Those fields were ignored for source judgment. No comparison, expected winner, speed, cost, lifecycle, identity-delivery, or quota judgment is made. The substantive critique was inspected; literal critic model-family identity and chronological independence are not established by public source contents and remain host/provenance questions. This review did not create a Goal, delegate, contact candidates, or send feedback.

Independent public primary retrievals and their bytes are retained under this review’s `sources/`. [capture-metadata.json](sources/capture-metadata.json) records exact URLs, access times, response metadata, and computed digests. There were 35 successful primary retrievals and one incorrect-path 404, subsequently resolved from the admitted public repository tree. All 42 final linked captures were byte-compared with their admitted predecessor files and matched. Matching bytes establish preservation/identity only. Public contents, definitions, callers, and release relationships establish the substantive source conclusions.

All writes were confined to this review directory. No input, repository, canonical Plan, WorkNode, account, issue, PR, external runner, or infrastructure was changed. No downloaded code was executed. Unknown distinct usage and billing fields are `null` in the machine artifacts.

## Material defects

### D1 — A false correction confuses protobuf cardinality with semantic validity

**Final locations:** lines 21, 36, 78, 112, and 134; most directly line 21 says absence of `FeedHeader.timestamp` “is not a specification violation,” and line 78 makes that assertion a proposed acceptance expectation.

**Governing condition:** a feed declaring GTFS Realtime **2.0 or higher**. The final pins the Schedule reference, Realtime reference, and proto together at `google/transit` commit `3c9e7b904b5035349622f03e11851e25c16d1d99`, without a version-1-only qualification.

The pinned [Realtime reference](https://raw.githubusercontent.com/google/transit/3c9e7b904b5035349622f03e11851e25c16d1d99/gtfs-realtime/spec/en/reference.md), local [capture](sources/gtfs-realtime-reference.md), lines **3–27 and 106–109**, defines producer semantic requirements for v2.0+ and marks the header timestamp required. Its v1.0 exception is explicit. The pinned [proto](https://raw.githubusercontent.com/google/transit/3c9e7b904b5035349622f03e11851e25c16d1d99/gtfs-realtime/proto/gtfs-realtime.proto), local [capture](sources/gtfs-realtime-proto.proto), lines **32–37 and 71–79**, says its field cardinalities are protobuf cardinalities and directs semantic interpretation to the reference. Thus successful protobuf decoding without a timestamp does not establish semantic conformance.

The source-level error is consequential: it misclassifies malformed v2+ producer output and places a wrong conformance expectation in acceptance. A consumer can intentionally retain usable per-trip data while reporting the header defect. Such tolerance does not support the final’s unconditional specification claim. The otherwise useful separation of fetch/header/trip times does not cure that false claim.

**Preservation finding:** research line 19 called the header timestamp required. Critic C1, lines 24–27, rejected that statement using the proto’s optional encoding field without reconciling the governing reference. Final line 112 accepts the mistaken correction. This is a concrete case where faithfully incorporating criticism reduces source accuracy. The research wording was overbroad for v1.0, but the critic’s blanket opposite is incorrect for v2.0+.

**Evidence digests:** Realtime reference `810b50a96e5a158b13bc968cc77a3ab782cd1971ee10bbc3481e3ae2eb48170d`; proto `8feff2c5499e0ff08777e203e49ef702e07be0a8376b8bb2126add311a709299`. Independent retrievals began at 2026-10-07T20:06:25Z; exact per-source times are in metadata. Check **SC04**.

### D2 — Known non-service is not reconciled with schedule fallback

**Final locations:** result contract line 24; selected-stop behavior line 42; transfer selection line 54; acceptance line 79; general fallback line 128. Cancellation/deletion interaction at line 44 corroborates the same incomplete precedence contract.

**Governing condition:** a fresh, correctly matched update marks the configured transfer stop `SKIPPED`. The final groups that status with `NO_DATA` as producing no transfer estimate, while P3 directs a leg without an eligible estimate back to its Schedule event. It does not state that the known skipped service prevents using that stop as a transfer leg. Nor does its result contract bind negative trip status above the general fallback.

The pinned Realtime reference, local [capture](sources/gtfs-realtime-reference.md), lines **220–222**, distinguishes a skipped stop from absent realtime timing. The pinned [Trip Updates explanation](https://raw.githubusercontent.com/google/transit/3c9e7b904b5035349622f03e11851e25c16d1d99/gtfs-realtime/spec/en/trip-updates.md), local [capture](sources/gtfs-realtime-trip-updates.md), lines **26–30**, supplies the corresponding stop and propagation context. Missing prediction can justify a labeled Schedule fallback; a positive report that the vehicle will not stop there is a different condition.

This is a **material ambiguity/conflict in the authored plan**, not proof that a particular implementation would choose the wrong branch. An implementer could invent precedence and return `UNKNOWN`, but the purported complete binding contract has not specified it. Merely declining a realtime estimate does not bind exclusion of a schedule-only connection through the skipped stop. The final’s correct canceled/deleted rider-list treatment likewise does not explicitly resolve P3’s fallback for those trip states. These corroborating cases are counted under D2, not as additional errors.

**Evidence digest:** Trip Updates explanation `059a2adc41e90c908e5c8786076b514797139a74d804204318c6d164e9bd7e83`, captured 2026-10-07T20:10:09.022719Z; reference digest as above. Checks **SC09–SC10**.

### D3 — Temporal slack omits known boarding/alighting restrictions

**Final locations:** `ConnectionInput`/result contract line 24, P3 lines 52–56, and acceptance lines 77–82. These enumerate identity, event times, mapping, duration, transfer types, and freshness but no boarding/alighting eligibility.

**Governing conditions:** the arriving event has `drop_off_type=1`, or the departing event has `pickup_type=1`; arrangement-required values also lack a disposition. These are valid Schedule conditions, not inferred crowding or uncertain physical accessibility.

The pinned [Schedule reference](https://raw.githubusercontent.com/google/transit/3c9e7b904b5035349622f03e11851e25c16d1d99/gtfs/spec/en/reference.md), local [capture](sources/gtfs-schedule-reference.md), lines **309 and 316–317**, defines stop-event pickup/drop-off restrictions and conditions travel on them. A selected route can have timed stop records while not permitting the necessary passenger action. The final’s timing-only contract does not address this supported and directly relevant mechanism.

The no-boarding-guarantee boundary is appropriate for unknown outcomes. It does not account for a known published prohibition. This omission matters even with only one fixed transfer and twenty stops; stop-event restrictions can vary between trips on the selected route. Neither a reviewed physical stop mapping nor a structurally valid archive establishes trip-specific eligibility. No actual agency is alleged to publish these conditions; this is a condition the general proposed contract and acceptance plan leave unhandled.

**Evidence digest:** Schedule reference `1ff40b8001b180bd023dd6f1899907aecbcb4600c8dbcb6fc6c841a50839b147`, independently captured 2026-10-07T20:06:25Z. Check **SC14**.

## Six-axis assessment

### 1. Original obligations, frozen decisions, and owner decisions

The supplied brief and plan were read completely. All P1–P6 parent decisions and every clause were compared with the final, rather than trusting its self-declared O status. No whole-project or absent cross-reference coverage is inferred from the bounded input.

| Obligation | Assessed result |
|---|---|
| O1: brief-led discovery, primary sources, useful negatives/options | Useful bounded discovery beyond the initial plan: feed state, producer age, instance identity, service-day time, provenance/replay, transfer rules, validator evolution, and a routing alternative. D3 is a relevant missing mechanism. Open-discovery-before-comparison chronology is not independently proven by artifact self-report. |
| O2: immutable component code with governing context | Satisfied as a bounded investigation of an alternative: OTP matcher code, release identities, callers, and governing definitions. The actual product-owned TripUpdate/parser logic remains unselected and unevaluated. The brief permits investigation of a discovered alternative; it does not require adopting that component. |
| O3: pertinent issue/fix/regression/release | Satisfied for the explicitly bounded VehiclePosition history. Exact old code, fix, regression sources, tag identities, and release ancestry were checked. No test-pass or current-defect inference. |
| O4: full P1–P6 comparison | All six dispositions exist and all 31 clauses were assessed. Scope is retained; source correctness and complete calculator behavior fail under D1–D3. Some comparison/history/operator details remain limited. |
| O5: substantive criticism preserved | All nine C1–C3/P1–P6 dispositions are visible. C1 is scientifically wrong; C2 and C3 have meaningful dispositions. Family provenance is excluded from source grading. |
| O6: complete proposed-change artifact | The required artifact form is present: replacement sections, contract, alternatives, retains/rejects, criticism, proposals, and uncertainty. Its substantive claim to a complete trustworthy contract fails under D1–D3. |

The 31 plan clauses comprise P1 **4**, P2 **4**, P3 **5**, P4 **4**, P5 **7**, and P6 **7**. They include source-selection authority, agency Realtime availability, twenty stops/two routes, source distinction, walking allowance, no occupancy/accessibility/dispatch promises, input inspection and later review, seven-day history, no identities, all three component decisions, tablet/connectivity/age/failure behavior, and every named acceptance class. Exact outcomes and line locations are enumerated in `coverage.json`.

The 15 owner decisions assessed are: actual feeds/terms; selected stops and mapping; walk/buffer values; freshness/skew thresholds; relationship/frequency/direct-event support; declared feed-version compatibility; concrete parser/runtime; tablet/browser/network/timezones; warm/cold performance budgets; volunteer/public access and vehicle-ID privacy; retention acceptance; actual alert/legacy-period support; schedule-only usefulness; approval authority for feed/mapping changes; and local fixtures/reliability acceptance. The first twelve and the fifteenth are explicit choices or unresolved conditions in the final. The two other original open decisions are not explicitly preserved; they are assessed limitations, not hidden satisfaction.

P4’s saved-view purpose can be met by a versioned evaluated-result snapshot and its input records; I do not impose a screenshot bitmap requirement. The final does not fully specify the later-observation comparison interaction or distinguish verified past events from old predictions. P5 records import results and unavailable/anomaly states, but a dedicated operator diagnostics view is not bound. These are limitations recorded in **SC20–SC21**, rather than invented execution failures.

### 2. Consequential claims, governing conditions, and versions

All **25** consequential groups SC01–SC25 were assessed. Besides D1–D3, the remaining material source conclusions are supported or qualified:

- **Identity and versions:** Feed scoping, frequency-instance keys, repeated-stop sequence handling, and conditional `feed_version` comparison are supported. Equality compares publisher declarations, not archive integrity. Requiring explicit dates beyond the standard’s necessary cases is conservative consumer policy.
- **Snapshot semantics:** Protobuf defaults to `FULL_DATASET`; `DIFFERENTIAL` remains unspecified. Replacement/removal behavior is supported. The semantic v2+ reference still requires producer incrementality; consumer default acceptance does not certify a conforming feed.
- **Time and events:** Service-day/agency-timezone conversion, signed delays, absolute-time precedence, and omitted-versus-zero uncertainty are supported. Direct-event-only matching is explicitly narrower than the standard’s propagated timing; local usefulness remains unknown.
- **Freshness:** The 90-second/10-minute cutoffs are disclosed proposed policies. Producer guidance and the load-balancer caveat support separating acquisition and object times. A fresh alert header does not establish individual alert recency, as the final admits.
- **Alerts:** The pinned proto has communication and impact periods and deprecates active_period; the reference still documents active_period. The final’s selector and boundary semantics are supported, while requiring communication_period for rider display is a conservative chosen policy that can omit legacy alerts.
- **Transfers:** Type semantics and the required type-2 minimum are supported. The maximum formula is a product decision, not a GTFS-defined precedence rule. Selecting an “applicable” rule leaves route/trip specificity, station-child scope, ties, and cross-feed rule ownership insufficiently explicit; no actual wrong rule is inferred.

The OTP code pin is **v2.10.0 → `521cd5d8acaae628878f43bf5946f4942c118548`**. Reviewer-captured tag-ref/object metadata confirms it. `RealtimeVehiclePatternMatcher.toRealtimeVehicle` at lines **345–415** performs scoped lookup and date inference; `inferServiceDate` at **149–213** supplies the mechanism. [FeedScopedId](sources/otp-v2.10.0-feed-scoped-id.java), lines **13–29 and 152–170**, and [ServiceDateUtils](sources/otp-v2.10.0-service-date-utils.java), **48–73**, provide governing definitions. [PollingVehiclePositionUpdater](sources/otp-v2.10.0-polling-caller.java), **61–74**, delegates through the reviewer-captured [VehiclePositionUpdaterRunnable](sources/otp-v2.10.0-updater-runnable.java), **31–44**. This is the VehiclePosition path; no TripUpdate validation is implied.

The history chain was checked in full:

1. [Issue #4058](https://github.com/opentripplanner/OpenTripPlanner/issues/4058) names deployed commit `b0c9829e3bfe10daddae72485a09a7f48b0be8ff`. The exact [captured old matcher](sources/otp-issue-observed-b0c9829e-vpm.java), **97–129**, returns without association when the service date cannot be parsed. The issue’s different embedded code-link commit was also inspected; it has the same captured matcher bytes.
2. [PR #4066](https://github.com/opentripplanner/OpenTripPlanner/pull/4066) supplies inference and regression changes. [Patch](sources/otp-pr-4066.patch) ranges **99–165, 675–745, and 2445–2454** and [PR metadata](sources/otp-pull-4066.json) establish the change and merge `d9bf0bbec860c66591a993ee62760447b9f00537` on 2022-04-22.
3. The [public comparison](sources/otp-4066-to-v2.2.0-compare.json) reports `ahead`, `behind_by=0`, and that merge as `merge_base_commit.sha`. [Tag object](sources/otp-v2.2.0-tag-object.json) binds v2.2.0 to `0e15511b630347df581f1f230de7f470db1b7b26`. Released [matcher](sources/otp-v2.2.0-matcher.java), **112–152 and 240–278**, and [tests](sources/otp-v2.2.0-matcher-test.java), **43–52 and 168–208**, contain the changed behavior and cases.
4. v2.10.0 [test source](sources/otp-v2.10.0-matcher-test.java), **82–93 and 540–559**, retains inference/midnight cases. This establishes released source presence and evolution, not test execution, DST correctness, or local feed quality.

The latest Validator endpoint independently still returned **v8.0.1**, published **2026-05-12**. Issue #2174 describes the minimum-transfer rule, but its source-map “open” metadata is inaccurate: the [public API capture](sources/gtfs-validator-issue-2174.json), `state`/`closed_at`, says closed on 2026-09-16. The final does not claim it remains open or establishes a v8.0.1 defect. Neither closure nor merge is treated as release proof. **SC19** records the metadata qualification without adding a final material error.

All these captures have exact URL, version identity, digest, and ranges in `source-checks.json`; live documentation is labeled by access time rather than falsely treated as immutable release code.

### 3. Discovery, mechanisms, alternatives, negatives, and opportunities

The research has useful content outside a journey-planner feature list: replacement versus delta state, producer versus fetch freshness, load-balanced feed behavior, identity namespaces, DST/service-day representation, deterministic replay, privacy/retention, and the limits of validator and issue evidence. OTP and MobilityData Validator supply actual product/tool comparators. Negative findings—missing update is not on-time evidence, positions are not event predictions, and validation tooling is not an application correctness oracle—remain useful and preserved.

The discovery is narrow around standards, a routing platform, and a validator. A bounded independent search also found a directly relevant display analogue: [OneBusAway Sign Mode](https://developer.onebusaway.org/features/sign-mode), captured [here](sources/onebusaway-sign-mode.html), **Sign Mode section**, and the maintainers’ [Waystation announcement](https://opentransitsoftwarefoundation.org/2026/09/waystation-goes-live-at-uc-san-diego/), captured [here](sources/waystation-announcement.html), **Why Waystation / Built on the OneBusAway Ecosystem**. These expose unattended updating and failure-isolation opportunities. This is evidence of a useful missed optional lead, not a requirement to select it, a comparative winner judgment, proof of compatibility, or exhaustive opportunity recall. No alternative implementation was installed or executed, and no rewritten candidate plan is supplied.

D3 is more consequential than omission of a named product: it omits a directly governing eligibility mechanism from the proposed transfer contract. Naming uncertainty about actual local feeds does not discharge that general design condition.

### 4. Incorrect corrections, rejections, and already-covered dispositions

D1 is the clear incorrect correction. The stricter per-trip freshness decision and revised transfer formula are different: both are disclosed product choices with supported premises, not newly discovered specification mandates.

Critic C3 correctly limits the OTP evidence to VehiclePositions. However, requiring a pinned implementation of the ultimately adopted custom component would be stricter than the original brief, which permits a discovered alternative. I therefore credit the bounded OTP inspection under O2 while leaving actual implementation selection unresolved. Acknowledging that open decision does not prove the proposed custom logic correct.

Rejecting a full OTP engine for the fixed view is a product architecture choice. No empirical claim that it is slower, costlier, or incapable is established or required. Rejecting ambiguous identity, unsupported relationships, delta merging, or unknown alert timing is disclosed conservative behavior; the source does not make every such rejection compulsory. Direct-only updates and communication-period-only alerts can sacrifice useful valid data and require feed-specific owner review.

Final line 134 says “already covered in the inherited draft,” not already covered by every frozen plan. That distinction is supported: separate acquisition/publisher time appears in research line 19, replay in 37, missing-update meaning in 23, service-day handling in 33, cache labels in 25, and execution limits in 85. The original P1 already covered identity/acquisition; P2 covered source distinction and unavailable-observation caution; P4 covered input inspection/history. Added matching/replay/freshness details are not falsely attributed to absent whole-project cross-references. The header requirement correction remains wrong despite its already-covered commentary.

### 5. Preservation from research through criticism into final

All nine criticism rows are accounted for:

| Criticism | Final location | Preservation/source judgment |
|---|---:|---|
| C1: header optionality and freshness levels | 112 | Accepted visibly; timestamp separation improves clarity, but the conformance correction is D1. |
| C2: one transfer threshold | 113 | Accepted; maximum formula, required minimum and proposed boundary tests are visible. |
| C3: OTP applicability/concrete dependency | 114 | Accepted applicability limit; concrete implementation remains open; no TripUpdate validation claim. |
| P1: conditional versions/activation distinction | 115 | Retained in P1 and acceptance. |
| P2: relevant alerts and DELETED distinction | 116 | Retained with explicit communication/impact policy and experimental status. Legacy alert applicability remains limited. |
| P3: reviewed mapping/threshold/same vehicle | 117 | Retained with source-supported conditions. |
| P4: replay/retention/access | 118 | Retained; vehicle-ID access and retention remain unresolved. |
| P5: intentional owned logic versus evaluated dependency | 119 | Partial disagreement visible; named library/runtime not falsely claimed evaluated. |
| P6: additional proposed tests | 120 | All critic-named categories appear; execution limits preserved. |

The central scope, no-promise boundaries, feed scoping, seven-day proposal, source history, local-data uncertainty, negative leads, optional OTP/VehiclePosition opportunities, and no-execution claims survive. The final additionally resolves some earlier open questions as proposals: transfer composition, per-trip timestamp absence, alert-period absence, and relationship support. It labels owner confirmation rather than implying observed reliability.

Two original open decisions are lost as explicit questions: research line 81 asks whether a schedule-only kiosk is useful and who approves mapping/feed changes. The final assumes schedule-only output and a curator, with general owner confirmation. These are limited preservation losses **OD13–OD14**, not invented source facts. The user-configured allowance also becomes a curator-reviewed allowance; that is a reviewable proposed role choice, not an inevitable component correction. No surviving objection or counterpart answer was silently supplied by this reviewer.

### 6. Proposed validation, executed checks, and witness applicability

The final proposes all original acceptance classes: replacement, missing Realtime, identifiers, overnight service, clock changes, and performance at twenty stops. It adds timestamp levels/boundaries, entity removal, direct event handling, alert selectors/time windows, transfer minima/composition, mapping changes, cache/history/privacy/replay, and DELETED. The proposals are concrete enough to review as a suite; D1 gives one erroneous expected conformance result, and D2–D3 leave important eligibility expectations unbound or absent.

Actual admitted evidence consists of public retrieval, version/tag resolution, source/caller/proto inspection, issue/fix/test-source inspection, and release comparison. This review independently checked those source relationships and capture identity. Neither artifact text, successful HTTP retrieval, hash matching, release ancestry, nor source-test presence is treated as an executed behavioral witness.

No application build, validator run, local feed evaluation, OTP/application test run, browser/tablet verification, or performance benchmark was established or performed. The p95 target is expressly proposed; no cold-load target is claimed. Source-code inspection cannot prove local prediction accuracy or transfer success. Not executing application tests is not itself a failure of this brief, which requires proposals and honest execution limits rather than a built service.

## Final disposition and assessment limits

**FAIL** is supported by D1–D3 after assessment of the entire declared scientific scope. The report does not infer failure from delivery, identity, Goal disposition, or cost. Supported discoveries, bounded code/history evidence, and faithful critique preservation are credited; open deployment decisions are not mistaken for evaluated components or validated reliability.

**Unassessed obligation IDs: none. Unassessed consequential check IDs: none.** Actual local applicability, future implementation behavior, literal model-family provenance, procedural chronology, and exhaustive discovery recall are limits or excluded dimensions, not silently assessed empirical results. `coverage.json` distinguishes an assessed open/defective obligation from a satisfied one. No rescue implementation or rewritten candidate answer is proposed.
