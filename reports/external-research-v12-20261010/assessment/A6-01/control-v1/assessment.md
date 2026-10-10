# ER12 independent semantic assessment — A6-01 control-v1

**Source judgment: FAIL.** The completed ordinary final has one remaining material conflict (F-01): its universal static-trip acceptance rule does not accommodate the NEW trip relationship that it conditionally includes. All six rubric axes, all eight exact numbered plan clauses and all five criticisms were assessed. The review was completed within its 45-minute envelope; no axis was capped or guessed.

This is an independent assessment of the original frozen discovery, draft, critique and reviser final, not a candidate repair. The substantial source-supported work and corrected predecessor defects are credited below. Delivery, native/T3/protocol/time/effective/billing evidence are separate from the source judgment.

## Authority, completeness and method

I read the full [rubric](ER12_RUNTIME/assessment/RUBRIC-v1.md), original frozen [brief](ER12_RUNTIME/frozen-inputs/A6-01/brief.md) and [plan](ER12_RUNTIME/frozen-inputs/A6-01/plan.md), the complete [terminal root freeze](ER12_RUNTIME/runs/A6-01/control/terminal-science-freeze-root.json), all four original authored science documents, all three source maps, all three evidence indexes, every per-stage assignment/input-map/freeze, the complete reveal record/released plan, and the bounded run request/dispatch/status records. The actual maps lead to investigator → critic → reviser; the ordinary final is [stages/reviser/final.md](ER12_RUNTIME/runs/A6-01/control/stages/reviser/final.md). There is no A7/A2 treatment final in this assignment.

All declared authored evidence is present: the source maps carry observations and the indexes link primary sources. No raw stage source captures or separate critique-check/disposition files are declared or present; criticism dispositions are in the final. A standalone reviser status.json is absent, but the terminal root freeze carries its T3 terminal snapshot. This is recorded as a telemetry boundary, not a missing science final.

I independently retrieved the 19 declared primary URLs and seven exact-code/API supplements, inspected governing field context, released code, complete relevant issue/PR bodies and the complete two-method test patch. The [independent navigable evidence index](evidence/index.md) and [source-map.json](source-map.json) bind claims to exact URLs, versions/commits, local locators, access times and retained capture hashes. Full original inspected hashes are in [original-inspected-hashes.json](original-inspected-hashes.json). Hashes and counts establish byte provenance only; they were not used as semantic proof.

The read-only integrity check found no change to any original inspected file and no mismatch in 32 stage/root frozen-input/science comparisons. The review used no nested delegation, candidate assistance or repair, account changes, Git/publication, other arms/results/history or ER11 rescore.

## F-01 — remaining material acceptance conflict

**Classification:** material wrong / unsupported consequential acceptance rule. **Affected meaning:** conditional NEW handling under obligations 1–2/8, consequential source applicability, final correction and draft-to-final preservation.

The final says: “Resolve each TripUpdate to exactly one trip instance in the exact approved schedule:” ([final.md](ER12_RUNTIME/runs/A6-01/control/stages/reviser/final.md:31)). Its fallback paragraph then directs zero/multiple-match descriptors to be rejected or quarantined ([final.md](ER12_RUNTIME/runs/A6-01/control/stages/reviser/final.md:35)). It also includes a correctly described NEW full-journey relationship in its conditional support inventory ([final.md](ER12_RUNTIME/runs/A6-01/control/stages/reviser/final.md:44)).

The governing [GTFS Realtime TripDescriptor reference](https://gtfs.org/documentation/realtime/reference/#message-tripdescriptor) makes NEW an exception to identifying an existing GTFS trip. For NEW, trip_id must be novel relative to the static feed, route_id must identify an existing static route, and the complete new journey is supplied in StopTimeUpdates. See the independently captured [E02.txt](ER12_RUNTIME/assessment/A6-01/control-v1/evidence/E02.txt:974), especially lines 975/984/995/1000 and 1044. A feed-version binding still links route/stop references to the correct dataset; it does not create a pre-existing static trip with that new ID.

A prospective semantic counterexample is a fresh, version-bound, partner-supported NEW trip N on known route R, with both known terminal stops and a complete stop/time journey. N is absent from static trips.txt by requirement. It consequently has zero existing-static-trip matches, and the final universal gate quarantines it. A declared extra departure can disappear despite valid freshness, source binding and relationship support. This is a source-grounded textual counterexample, not an executed parser/product test or a claim about the unknown operator feed.

I considered the strongest qualification: the later list correctly calls NEW unrelated to an existing trip and correctly says REPLACEMENT does not use original static times. Those statements deserve credit, but they do not provide an exception to the explicit each-TripUpdate/static-schedule/zero-match gate. Reading that gate as applying only to ordinary scheduled trips adds the qualifier that was explicit in the [draft](ER12_RUNTIME/runs/A6-01/control/stages/investigator/draft.md:21) and is absent from the final. The final still offers conditional support rather than explicitly selecting a schedule-only route that excludes NEW.

This finding does not impose NEW support when the partner lacks it, require exhaustive protobuf implementation, or demand a deployment. It judges the proposal on its own conditional inventory and consequential acceptance instruction. The legitimate unresolved partner inventory does not resolve that source-semantic conflict. PASS_WITH_LIMITATIONS is therefore unavailable under the rubric.

## Separate assessment of all six axes

### 1. Original obligations and negative constraints

**Coverage: ASSESSED_COMPLETE; judgment: FAIL.**

All eight obligations have substantial explicit treatment and every negative constraint is retained. One route/two terminals, planning-only scope, optional staff advisory and owner authority are preserved. Obligation 2 remains materially compromised by the contradictory acceptance rule for conditionally supported NEW trips. The failure is not an invented requirement to build or support every enum.

### 2. Consequential source claims and exact applicability

**Coverage: ASSESSED_COMPLETE; judgment: FAIL.**

Independently retrieved all 19 declared primary URLs and seven source/API supplements. Static identifiers, date rules, agency timezone, DST, frequency distinction, version metadata, absent-update/NO_DATA semantics, alert selectors, freshness guidance, OTP release/default/flag/test scope, and SIRI versions are substantially supported. The final omits the NEW exception when prescribing its universal static-instance gate. This is the one remaining material source-condition error.

### 3. Useful unfamiliar discovery, alternatives, implementation/history and opportunities

**Coverage: ASSESSED_COMPLETE; judgment: PASS_WITH_LIMITATIONS.**

The direct adapter versus OTP comparison is operationally meaningful at pilot scale, and NeTEx/SIRI is a bounded schedule-plus-update/situation analogue rather than an unsupported partner claim. The work finds optional schedule-version linkage, GraphQL feed-version visibility, polling backpressure/default/configuration risk, narrow test provenance, DST and frequency implications, and advisory provenance. The #6252 -> #6262 -> 2.7.0 chain identifies the affected operation and honestly reports that no timetable revision is named. An exhaustive product catalogue was not required. Actual partner and owner choices remain unknown.

### 4. Wrong criticism, corrections/rejections and exact plan dispositions

**Coverage: ASSESSED_COMPLETE; judgment: FAIL.**

Every original numbered plan clause and C-01 through C-05 has an explicit disposition. Trip-ID-only matching, indefinite last-message display, all-disruptions-as-delays and calendar-day assumptions are correctly rejected. Optional banner and ownership are correctly retained. All five criticisms are substantially source-supported; none falsely demands removing authorized scope. The C-04 acceptance expands the enum inventory correctly but does not reconcile the NEW exception with the final acceptance rule, creating F-01. Critic agreement is not credited as proof.

### 5. Supported meaning preserved through discovery/draft/critique/final

**Coverage: ASSESSED_COMPLETE; judgment: FAIL.**

The final is self-contained and preserves route alternatives, useful history, mismatch as local policy, uncertainty, all owner rights, advisory conditions and actual validation status. The frequency/DST/SIRI/test qualifications are real final improvements, and their predecessor defects are retained separately as lineage. However, the draft scheduled-trip qualifier is lost in the final global acceptance gate, so supported NEW scope and correct instance-matching meaning are not coherently preserved.

### 6. Meaningful proposed versus executed validation and oracle applicability

**Coverage: ASSESSED_COMPLETE; judgment: PASS_WITH_LIMITATIONS.**

Public retrieval and released code/test reading are correctly described as executed research. No operator feed, parser, prototype, pilot product test or deployment is claimed executed. Proposed checks are discriminating: version match/mismatch/omission, repeat/frequency and late-day identity, DST and calendar exceptions, freshness/NO_DATA/skip/cancel, independent alert scope/removal, OTP configuration/load/recovery and advisory expiry/retraction. Their oracles are applicable only to actual supported relationships, exact feeds and selected release/configuration. Merely proposing all relationships does not resolve F-01 or establish a correct NEW oracle. Reading the two OTP test methods does not establish execution or load performance.

## Exact original plan clauses and dispositions

The following quote every numbered clause and its actual draft treatment, rather than substituting an inferred assessor key. Source IDs link through the independent evidence index.

### Clause 1

**Exact clause:** Compare two realistic display/ingestion routes and an analogous schedule-plus-event-stream mechanism.

**Exact plan treatment:**

> Use trip IDs alone to join every realtime message to the current timetable. Display the last received message until another arrives.

**Disposition assessed: CORRECTED WITH REMAINING MATERIAL CONFLICT.** The universal trip-ID join and indefinite display are properly rejected; direct adapter, OTP and SIRI/NeTEx are compared. The final corrects ordinary instance matching and freshness, but F-01 remains for NEW acceptance.

Final locator: [final.md](ER12_RUNTIME/runs/A6-01/control/stages/reviser/final.md:88). Evidence: E01, E02, E05, E08, E09, E14, E20.

### Clause 2

**Exact clause:** Explain static trip/service identity, realtime message types, freshness and mismatch behavior without inventing predicted departures.

**Exact plan treatment:**

> OpenTripPlanner is the first candidate; a lightweight custom display is the second route pending research. Neither is approved for deployment.

**Disposition assessed: CORRECTED WITH REMAINING MATERIAL CONFLICT.** OTP remains an unselected alternative; evaluating the thin board first is an explicit scale-based local recommendation. Trip/service identity, absence, freshness and version policy are explained. F-01 affects conditional message handling.

Final locator: [final.md](ER12_RUNTIME/runs/A6-01/control/stages/reviser/final.md:89). Evidence: E01, E02, E03, E05, E06.

### Clause 3

**Exact clause:** Investigate related identifier, service-day/time-zone and alert-applicability conditions together, while preserving their distinct semantics.

**Exact plan treatment:**

> Treat all disruption messages as delayed departures and assume times fit within a calendar day. Service-day, timezone and alert scope are deferred.

**Disposition assessed: CORRECTED.** Rejecting disruption-as-delay and calendar-day assumptions is supported. Service_id/calendar activation, GTFS Time/timezone/DST, instance identity and alert selectors retain distinct semantics and joint validation.

Final locator: [final.md](ER12_RUNTIME/runs/A6-01/control/stages/reviser/final.md:90). Evidence: E01, E02, E04.

### Clause 4

**Exact clause:** Trace a relevant released feed/consumer change or failure/fix chain, identifying the operations and timetable revisions it governs.

**Exact plan treatment:**

> No consumer history is attached. The manual banner is retained, but its precedence and disclosure relative to feed data are unspecified.

**Disposition assessed: CORRECTED.** The released OTP polling chain is supplied and no exact timetable revision is fabricated. Manual/feed contradiction handling and attribution are supplied in the advisory section; duty-manager resolution is a local policy, not a GTFS precedence mandate.

Final locator: [final.md](ER12_RUNTIME/runs/A6-01/control/stages/reviser/final.md:91). Evidence: E11, E12, E13, E20, E24, E25.

### Clause 5

**Exact clause:** Preserve and investigate this supported optional scope: a staff-authored advisory banner when machine-readable disruption data is unavailable. It is an authorized option, not a mandatory feature or an established technical capability; recommend conditions, retain it when supported, and explain any evidence-based exclusion.

**Exact plan treatment:**

> Retain a staff-authored advisory banner when machine-readable disruption data is unavailable as supported owner-authorized optional scope. Support here means that the brief explicitly permits it; technical support, conditions and interoperability still need research. Do not remove it merely because the baseline route lacks it, or silently promote it to mandatory scope.

**Disposition assessed: RETAINED OPTIONAL; CONDITIONS INVESTIGATED.** Authorization is kept distinct from an existing capability. Separate provenance, duty-manager approval, affected scope, validity, expiry, audit, correction and retraction are proposed. Lack of an identified existing publishing tool remains an honest owner input; the option is neither excluded nor made mandatory.

Final locator: [final.md](ER12_RUNTIME/runs/A6-01/control/stages/reviser/final.md:92). Evidence: INPUT-BRIEF.

### Clause 6

**Exact clause:** Make owner decisions explicit: The schedule publisher owns timetable versions; the duty manager owns manual advisories and stale-data wording. The regional partner must confirm which realtime messages it actually supplies.

**Exact plan treatment:**

> Owner authority is reserved as follows: The schedule publisher owns timetable versions; the duty manager owns manual advisories and stale-data wording. The regional partner must confirm which realtime messages it actually supplies. The draft has not obtained these decisions. Its tentative implementation assumptions cannot substitute for them.

**Disposition assessed: RETAINED OWNER AUTHORITY; INPUT REQUIRED.** Schedule publisher still owns versions and rollback; duty manager still owns advisories and stale wording; regional partner still confirms actual realtime coverage. No generic documentation is treated as proof of partner capability.

Final locator: [final.md](ER12_RUNTIME/runs/A6-01/control/stages/reviser/final.md:93). Evidence: INPUT-BRIEF.

### Clause 7

**Exact clause:** Preserve negative constraints: Do not dispatch vessels, infer an ETA from missing data, treat service alerts as trip updates, or present a manual advisory as a realtime feed observation.

**Exact plan treatment:**

> Binding exclusions: Do not dispatch vessels, infer an ETA from missing data, treat service alerts as trip updates, or present a manual advisory as a realtime feed observation. The draft has no complete trace showing that its assumptions comply; revise the proposal wherever necessary to preserve these exclusions.

**Disposition assessed: RETAINED BINDING NEGATIVE CONSTRAINTS.** No dispatch, ETA from missing data, alerts converted into trip updates, or manual notice as feed observation is authorized by the final. NEW timings, if supplied, are producer data rather than invented ETAs.

Final locator: [final.md](ER12_RUNTIME/runs/A6-01/control/stages/reviser/final.md:94). Evidence: INPUT-BRIEF, E02, E03, E04.

### Clause 8

**Exact clause:** Deliver one coherent evidence-backed research proposal covering obligations 1–8, with recommendations, source/version applicability, useful discoveries, unresolved owner inputs, and a validation table separating checks actually executed from checks merely proposed. Do not report research sources or future tests as executed product validation.

**Exact plan treatment:**

> The draft currently contains no coherent evidence-backed final proposal. Its proposed demos are research/validation ideas only. A complete revision must preserve every obligation, disclose corrections and retained options, and not confuse documentation review with successful product operation.

**Disposition assessed: DELIVERED; SEMANTIC QUALIFICATION FAILS ON F-01.** A full coherent proposal, comparison, sources, history, owners and proposed/executed validation table are delivered. Delivery does not establish source correctness; F-01 prevents a source pass. Documentation and future pilot tests are not misreported as product operation.

Final locator: [final.md](ER12_RUNTIME/runs/A6-01/control/stages/reviser/final.md:95). Evidence: INPUT-BRIEF, E01, E02, E08, E24.

The remaining original plan context is also retained: one route/two terminals; OTP as a tentative lead without deployment approval; brief-only discovery before the released plan by contract; a planning proposal rather than implementation; read-only public research; and no invented operational result. The plan’s original validation handoff is reconciled explicitly: source/version review and comparison/history are reported as research, while scenario walkthrough, optional-path checks and end-to-end operation remain proposed/NOT_RUN. Discovery/reveal digests match. Full hidden-access and native-order compliance cannot be established from byte records alone.

## Independent disposition of every criticism

### C-01 — Static headway service lacks a display qualification

**Independent disposition: SUPPORTED; FINAL ADDRESSES.** Final disposition: Accept.

The draft does not expressly guard exact_times=0 static service against invented fixed departures. Final static schedule section distinguishes headway-based 0 from compressed schedule-based 1, conditions presentation on owner choice, and keeps actual applicability unknown. This is a corrected predecessor gap, not an additional remaining final failure.

Locators: [Original criticism](ER12_RUNTIME/runs/A6-01/control/stages/critic/critique.md:17); [Final disposition](ER12_RUNTIME/runs/A6-01/control/stages/reviser/final.md:101). Independent evidence: E01, E02.

### C-02 — DST service-day time basis is omitted

**Independent disposition: SUPPORTED; FINAL ADDRESSES.** Final disposition: Accept.

GTFS Time uses a service-day basis whose DST behavior differs from ordinary midnight plus elapsed seconds. Final explicitly states it and proposes spring/fall checks for the actual timezone/export. No calculation or product test is claimed. The seasonal brief does not establish that DST applies; the conditional investigation is appropriate.

Locators: [Original criticism](ER12_RUNTIME/runs/A6-01/control/stages/critic/critique.md:25); [Final disposition](ER12_RUNTIME/runs/A6-01/control/stages/reviser/final.md:102). Independent evidence: E01.

### C-03 — SIRI current schema versus CEN-compatible branch is incomplete

**Independent disposition: SUPPORTED; FINAL ADDRESSES.** Final disposition: Accept and amend.

The current primary repository distinguishes functional v2.3 from CEN-matching v2.2 and recommends releases. It lists v2.2.1/v2.3 in October 2026. The investigator map calls v2.3-wip development, a stale/incomplete observation. Final preserves that earlier record separately and gives the current branch/release distinction without selecting a partner profile.

Locators: [Original criticism](ER12_RUNTIME/runs/A6-01/control/stages/critic/critique.md:33); [Final disposition](ER12_RUNTIME/runs/A6-01/control/stages/reviser/final.md:103). Independent evidence: E15, E26.

### C-04 — Current relationship inventory/conditions are incomplete

**Independent disposition: SUPPORTED; FINAL PARTIAL WITH F-01.** Final disposition: Accept and expand.

The criticism correctly distinguishes exact_times=0 UNSCHEDULED, NEW, DUPLICATED and REPLACEMENT and conditions cases on partner support. The final substantially supplies the missing enum meanings and DELETED; however its all-TripUpdate static matching gate still conflicts with NEW. The valid criticism is not itself a wrong correction; F-01 is in final consolidation of the remedy.

Locators: [Original criticism](ER12_RUNTIME/runs/A6-01/control/stages/critic/critique.md:41); [Final disposition](ER12_RUNTIME/runs/A6-01/control/stages/reviser/final.md:104). Independent evidence: E02, E03, E07.

### C-05 — PR test summary needs qualification by actual test code

**Independent disposition: SUPPORTED; FINAL ADDRESSES.** Final disposition: Accept and clarify.

PR body reports no unit tests, while commit 69ac4854678bb964715d4b7d143e457cc6b77dda adds two feature-on/off methods with an asynchronous callback. Final correctly distinguishes that narrow code from load/integration/ferry evidence, and says the tests were read rather than run.

Locators: [Original criticism](ER12_RUNTIME/runs/A6-01/control/stages/critic/critique.md:49); [Final disposition](ER12_RUNTIME/runs/A6-01/control/stages/reviser/final.md:105). Independent evidence: E12, E23, E24, E25.

The critic’s labels of material incompleteness are conditional on the feed and recommendation context. They do not establish that this ferry export uses headways, crosses DST, supplies a newer relationship or uses SIRI. The critic did not require an unauthorized implementation or reduce the manual option. Its agreement with the investigator is not semantic evidence. All five criticism claims were checked independently; F-01 is a remaining final-consolidation defect despite the supported C-04 concern.

## Consequential claim and applicability audit

Each row records the exact subject/operation and governing type, unit, domain, default or exception. The full structured records and source locators are in source-map.json.

| Claim | Subject/operation | Independent judgment and condition |
|---|---|---|
| SC-01 | Static identity/date activation | SUPPORTED. route_id/trip_id/service_id and stop IDs are distinct; service_id dates are calendar rules plus exceptions. Calendar-only or dates-only forms exist. IDs are CSV strings/foreign references; service dates use YYYYMMDD; not realtime instance IDs. Evidence: E01. |
| SC-02 | GTFS Time and timezone | SUPPORTED. Agency timezone governs stop_times; service day can extend beyond 24 hours; DST basis differs from naive midnight arithmetic. GTFS HH:MM:SS Time is not POSIX time. Stop timezone is not the timetable timezone. Evidence: E01. |
| SC-03 | Frequency representation | SUPPORTED IN FINAL; PREDECESSOR GAP CORRECTED. exact_times=0/empty is headway service; 1 is schedule-based compression. Exact_times=0 does not authorize invented exact static departures. headway_secs is a positive integer in seconds; exact_times optional default 0/empty. Evidence: E01, E02. |
| SC-04 | TripDescriptor matching | FAIL ON NEW EXCEPTION. Ordinary static trips may use trip_id; frequency instances need date/time; long/late collisions require date; alternate nonfrequency key must be unique. NEW is explicitly outside an existing-static-trip lookup. NEW requires novel trip_id plus existing route_id; zero static match is expected for that relationship, not invalid. F-01. Evidence: E02, E03. |
| SC-05 | Version metadata and mismatch policy | SUPPORTED. Realtime protocol version and static revision are different. RT feed_version is optional and matches static publisher text. Missing version is not verified alignment. Static feed_version Text is recommended; RT field string optional. Fail-closed display is a local proposal, not a mandatory consumer behavior. Evidence: E01, E02, E06, E07. |
| SC-06 | Prediction/absence/NO_DATA | SUPPORTED. Missing TripUpdate is not on-time evidence; NO_DATA has no realtime timing; cancellation/skip is status, not invented time. StopTimeEvent.time is int64 POSIX seconds; delay is int32 signed seconds; NO_DATA forbids prediction time/delay, while NEW/REPLACEMENT can still carry scheduled_time. Evidence: E02, E03, E05. |
| SC-07 | Relationship-specific identity and journey semantics | INVENTORY SUBSTANTIALLY SUPPORTED; F-01. UNSCHEDULED only exact_times=0; NEW supplies a complete journey; REPLACEMENT identifies original but supplies alternate stop/times; DUPLICATED references source through TripDescriptor and new identity through TripProperties; DELETED differs from CANCELED. DUPLICATED also has a source-service-within-next-30-days condition and forbids frequency exact_times=0/empty. The final is a scoped proposal, not a full protobuf parser specification; omitted exhaustive field rules are not separately invented obligations. Evidence: E02, E07. |
| SC-08 | Alert applicability | SUPPORTED. AND within selector; multiple selectors cover independent scopes; active ranges and route/stop/trip scope are separate from TripUpdate. EntitySelector.route_id is the route-wide field; absent active_period is displayable while in feed. Optional communication/impact fields have distinct purposes; impact ranges must fit communication ranges when supplied. Evidence: E02, E04, E07. |
| SC-09 | Freshness | SUPPORTED. Producer refresh/age guidance is accurately used as candidate thresholds requiring owner approval, not partner performance or protocol mandates. 30 seconds or content change, whichever more frequent; entity ages 90 seconds for TU/VP, 10 minutes for Alerts. Refreshed header does not by itself freshen entities. Evidence: E05. |
| SC-10 | OTP API route | SUPPORTED WITH VERSION LIMIT. A general-purpose GTFS GraphQL API and separate realtime Alert/TU updater configuration are real mechanisms; custom board UI and source policies remain necessary. Latest docs are moving; API enabled by default there. No server installation or pilot query was executed. Evidence: E08, E09. |
| SC-11 | OTP poller defaults/types | SUPPORTED FOR OBSERVED DOCS. HTTP Alerts and TU pollers require feedId/url; poll frequency is duration with PT1M default; fuzzy matching defaults false; alert earlyStartSec integer defaults zero. PT1M means one minute. These are current-doc observations, not all-protocol or all-release defaults. Evidence: E09. |
| SC-12 | OTP 2.10.0 release metadata | SUPPORTED. Versioned changelog dates 2.10.0 at 2026-09-09 and includes feed-version GraphQL exposure and service-date grouping fix. Release inclusion is not validation of the actual ferry export or transformed API response. Evidence: E10, E17, E21. |
| SC-13 | OTP load issue | SUPPORTED WITH L-01. Issue #6252 records 2.7.0-SNAPSHOT/National Rail GTFS+RT, 1-minute Alerts and 27-second TU polling and async-update accumulation. No exact static revision is named. Reporter says 20 minutes or more; slow-server/large-dataset/poll interval context. Reported external behavior, not a reviewer-run load test. Evidence: E11, E22. |
| SC-14 | Polling fix operation | SUPPORTED. PR #6262 fixes #6252, merged 2025-01-09 into dev-2.x; future wait is feature-gated across polling updater classes. Actual merge_commit_sha in API is b0b8661b6ea617a611b1af622d2b1c9249dcadbd. The map final-listed commit is not treated as the merge identity. Evidence: E12, E18, E23, E25. |
| SC-15 | Released inclusion/default/config override | SUPPORTED. 2.7.0 release on 2025-03-12 includes #6262. Exact v2.10.0 OTPFeature sets wait default true, non-sandbox, with optional feature override. Enabled source default is conditional on configuration; no zero-lag promise or schedule-version binding is established. Evidence: E13, E20, E21. |
| SC-16 | OTP test oracle | SUPPORTED. Commit 69ac4854678bb964715d4b7d143e457cc6b77dda adds two methods; one asserts completion after wait-on, one asserts incompletion after wait-off using a short async task. Source uses 100 ms callback sleep and fake/null graph context. Reading this code is not executing it and is not performance, feed integration or ferry validation. Evidence: E19, E24, E25. |
| SC-17 | NeTEx/SIRI analogue | SUPPORTED. OTP tutorial builds NeTEx timetable data and configures SIRI-ET and SIRI-SX separately using Transmodel references. Norwegian/Entur example is conditional; polling example is not proof of partner streams, endpoint access, profile or ferry compatibility. Evidence: E14, E26. |
| SC-18 | SIRI schema versus CEN release | SUPPORTED IN FINAL; PREDECESSOR OBSERVATION INCOMPLETE. README distinguishes v2.3 functional branch and CEN-matching v2.2; releases table lists October 2026 v2.2.1/v2.3. Use releases for published CEN document matching; exact partner profile/version remains unknown. Evidence: E15, E26. |
| SC-19 | Optional staff advisory | SUPPORTED LOCAL OPTION. The original brief authorizes an optional staff banner; proposed separate provenance/workflow does not claim GTFS or OTP provides an authoring tool. No existing CMS, staff workflow or launch selection is proven. Owners decide technical support and optional inclusion. Evidence: INPUT-BRIEF. |

## Useful discoveries, alternatives and preserved meaning

- **D-01 — Timetable revision metadata is separate from protocol version and IDs.** Supports explicit source-pair handoff and mismatch disclosure; missing optional fields require external binding, not a claim that IDs prove alignment. Preservation: discovery -> draft -> final; local fail-closed policy label retained. Evidence: E01, E02, E06, E07.

- **D-02 — Two ingestion/display routes have different operational burdens.** Thin board owns all joins; OTP adds graph/service/updaters but provides a maintained API and metadata. Pilot-scale first evaluation is an inference, not an observed deployment result. Preservation: Both routes and conditional selection criteria survive final. Evidence: E08, E09, E20, E21.

- **D-03 — NeTEx/SIRI separates timetable, expected journeys and situation messages.** A meaningful alternative ecosystem if the partner already publishes it; tutorial/profile does not establish ferry support. Preservation: Analogue retained; branch applicability corrected rather than option deleted. Evidence: E14, E15, E26.

- **D-04 — A released polling-backpressure fix does not validate feed identity or eliminate all lag.** History produces an exact configuration/load check, including a true default and override condition and a narrow test oracle. Preservation: History, missing timetable revision and limited test scope survive final. Evidence: E11, E12, E13, E20, E24, E25.

- **D-05 — Service-day, DST and headway representation affect static display independently of realtime identity.** Prevents a headway template or incorrectly mapped service-day time from becoming a fabricated departure. Preservation: Original service-day meaning retained; critic adds DST/frequency conditions in final. Evidence: E01, E02.

- **D-06 — Manual editorial notices can be preserved without pretending they are partner observations.** Distinct record/workflow, approval, expiry, scope, correction and retraction preserve authorized optional scope. Preservation: Kept optional through all stages; no existing CMS or mandatory launch promise invented. Evidence: INPUT-BRIEF.

The proposed first evaluation of a direct adapter is a scale/operating-cost inference, not an externally demonstrated product winner. OTP remains credible if already maintained or broader planning warrants its graph/server burden. NeTEx/SIRI remains conditional; the Norwegian example supplies an implementation lead, not partner compatibility. The optional advisory is not vacuous caution: authorship, scope, approval, validity, expiry, conflict resolution, correction and retraction form a useful prospective workflow. No catalogue, commercial CMS, installation or nonexistent deployment was required.

### Lineage versus final qualification

- **H-01 (discovery/draft): CORRECTED IN FINAL.** Headway-based static representation and DST service-day time edge are omitted/incomplete in predecessor prose. C-01/C-02 add appropriate conditional investigation; final includes both.

- **H-02 (investigator source map/index): CORRECTED IN FINAL; ORIGINAL RETAINED.** SIRI observation incompletely treats v2.3-wip as development and v2.2 as current stable. Current branch distinction is rechecked and the original S15 observation is retained under predecessor_observations.

- **H-03 (discovery/draft): CORRECTED IN FINAL.** Trip relationship inventory is incomplete and OTP testing summary lacks narrow-test detail. Final adds the relationship meanings and reconciles PR text with two methods.

- **H-04 (reviser final): REMAINING MATERIAL REGRESSION.** Draft acceptance rule explicitly says scheduled trip; final says each TripUpdate in exact approved schedule and zero-match rejection. NEW exception is not incorporated into that gate. F-01 remains notwithstanding the enum inventory correction.


## Validation and oracle applicability

Candidate product validation is **NOT_RUN / not established**. Primary documentation and released-code/history inspection are research; no exact ferry export, partner endpoint, parser, prototype or deployment was available. The proposal correctly does not treat a document review as successful board operation.

| Check family | Reported/actual status | Applicable oracle and limit |
|---|---|---|
| Public GTFS/OTP/SIRI retrieval and code/history inspection | Reported executed research; independently checked primary meaning here | Supports documented/source behavior only, not actual operator or partner performance. |
| Exact static feed | Proposed/NOT_RUN | Exact approved zip, active calendars, timezone, extended times, DST, frequencies and terminal mapping. No supplied feed means applicability is unresolved. |
| Realtime pairing/identity | Proposed/NOT_RUN | Explicit version match/mismatch/omission, single instance, late/day collision and actual supported relationships. F-01 prevents treating NEW’s absent static ID as an invalid instance. |
| Missing/stale/status/alerts | Proposed/NOT_RUN | Keep schedule with accurate status; no false ETA/on-time claim; scope AND and independent period/removal rules. Data timestamps and chosen thresholds govern. |
| OTP API/load/configuration | Proposed/NOT_RUN | Named release, exact config and dataset, GraphQL metadata/terminal results and representative polling/recovery load. Existing narrow tests do not supply this oracle. |
| Manual notice workflow | Proposed/NOT_RUN | Duty-manager-supported publish/approve/scope/expire/correct/retract, clear provenance and audit. No existing tool is established. |
| OTP two-method unit test | Source read only; not executed | Feature-on/off asynchronous completion under a small fake graph callback; neither load nor ferry-feed integration evidence. |
| Reviewer integrity checks | Executed read-only metadata check | Original bytes and declared handoff match; cannot establish source truth, native order or hidden runtime compliance. |
| F-01 counterexample | Analytical, prospective; no product execution | Demonstrates the rule/source conflict for an admissible NEW input; no actual feed behavior or deployment is asserted. |

## Limits and honestly unresolved inputs

- **L-01 — minor wording.** Final history says the issue reports up to 20 minutes of lag; the primary issue says 20 minutes or more. The proposal does not claim a bound, guaranteed performance, or dimension hardware from that number; this does not drive the FAIL.

- **L-02 — minor history ambiguity.** The final May 2025 relationship sentence should not be read as introducing DUPLICATED then. Primary revision history already records DUPLICATED support in July 2020. May 2025 records ADDED deprecation/NEW/REPLACEMENT. The final current DUPLICATED meaning is substantially correct; this historical compression is not a material remaining decision.

- **L-03 — honestly unresolved external input.** Exact static dataset/version/IDs/calendar/timezone/frequency representation, partner endpoint/profile/message inventory/version binding, and duty-manager workflow/wording/thresholds are unavailable. Publicly answerable standards/history were investigated; no actual external choice or deployment is invented.

- **L-04 — source provenance / source breadth boundary.** Authored source evidence consists of the three source maps and three navigable indexes. No retained raw stage retrieval captures were declared or present. Their statements that retrieval was executed are recorded as authored claims. The independent reviewer supplies separate fresh captures; these verify current primary meaning and cannot retroactively prove each candidate request. Latest OTP/living GTFS/SIRI sources are time-dependent; exact OTP tag/commit supplements are retained.

- **L-05 — protocol telemetry boundary.** A separate reviser status.json is absent in the bounded run inventory; root terminal freeze contains its recorded T3 terminal task state. No independent candidate native transport receipts, full tool trace or billing receipt were available in scope. Native/effective/protocol conclusions are qualified below; this absence does not change the source judgment.


## Delivery, native, T3, protocol, time, effective route and billing

These dimensions are intentionally separate from the semantic FAIL.

| Dimension | Evidence-backed assessment |
|---|---|
| Delivery | All required original science documents/maps/indexes present. Ordinary reviser final is complete. Root freeze records terminal delivery. |
| Native — investigator | UNKNOWN independently. The retained T3 summary reports native completion/about 15 minutes; no native transport receipt/ID/structured terminal result is retained in its science package. |
| Native — critic | UNKNOWN independently. Critique transcribes activation and the T3 summary reports completion for 01a12405-708e-7960-aee8-6bb901d7a6e1, 195,929 tokens/470 s. Retained as authored reports, not authenticated native accounting. |
| Native — reviser | UNKNOWN independently. Final/map transcribe activation, active preterminal snapshot and completion for 01a1240e-2764-7262-9ca9-11666df4d6bf, 173,100 tokens/446 s. No independent native transport receipt is retained. |
| T3 | Retained investigator/critic statuses and root final task snapshot report completed/result_available, no pending child runs. They are recorded T3 state, not a new live query or native proof. |
| Protocol | Intended three contexts, staged discovery/plan reveal and no nested delegation/repair are explicit. Frozen byte lineage matches; no unauthorized assistance is observed. Complete runtime access/context/Goal/order compliance remains UNKNOWN without a full trace. |
| Time | Recorded initialization 2026-10-10T03:57:22.231Z to root terminal observation 2026-10-10T04:37:05.387145+00:00 is 2383.156 s (about 39m43s), before whole deadline 2026-10-10T04:57:17.174Z. This record-based span is not native inference, effective occupancy, billing or a paired speed result. |
| Effective route | Requested and returned T3 route says AUTHORIZED_PROVIDER_INSTANCE / gpt-6-luna; requested max/priority options. Actual effective backend/options/tier and native method provenance are UNKNOWN independently. |
| Billing | UNKNOWN. Native token reports are not invoices or evidence of inference/billing savings. No speed or cost comparison with other arms is made. |

The reviewer’s own native Goal was actually activated before substantive inspection: 01a12419-b1fc-7692-bc61-8c0004486198, createdAt 1791607045. Its under-4,000-character objective references this bounded assignment. The full judgment is saved while that Goal is active; its genuine completion result is retained separately after saving, without rewriting the original assessment.

## Saved assessment artifacts

- [assessment.json](assessment.json): all six axes, exact plan clauses, criticism dispositions, findings, lineage, useful discoveries, validation and separate operational dimensions.
- [source-map.json](source-map.json): independent governing primary evidence and consequential claim checks.
- [evidence/index.md](evidence/index.md): navigable URL/capture/field/code evidence.
- [original-inspected-hashes.json](original-inspected-hashes.json): every original inspected artifact.

This assessment does not alter the original frozen pipeline. Any later dispute disposition must be separate from this original judgment.
