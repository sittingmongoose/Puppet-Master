# Independent critic review — A6-01-control

## Scope and method

I reviewed the complete brief, the frozen investigator discovery and draft, its source map and navigable source index, the released plan copy, and the plan-reveal record. All eight frozen input-file SHA-256 values match `freeze.json`; the frozen discovery and released-plan digests also match the plan-release record. The independent source record is in [source-map.json](source-map.json), with a navigable URL index in [sources/index.md](sources/index.md).

I opened the cited primary GTFS, OpenTripPlanner, and SIRI documentation, source code, release history, issue, and PR pages directly. The review is read-only. No operator timetable, partner realtime feed, prototype, parser, product, or local discriminating check was available or run. Public-source inspection is research evidence only. Proposed checks remain proposed/NOT_RUN.

## Overall assessment

The investigator package is strong and substantially faithful to the brief. It corrects the released plan's trip-ID-only join, indefinite display of last-seen data, conflation of alerts with trip updates, and calendar-day assumption. It compares a direct GTFS adapter/board with OTP and retains NeTEx/SIRI conditionally. It makes schedule, duty-manager, and regional-partner decisions explicit; preserves the optional staff advisory without promising a tool; carries all four negative constraints; and distinguishes research from product validation. I found no material false correction in its central GTFS/OTP recommendations.

The identified gaps are conditional and do not warrant reducing scope. They concern how the eventual static feed would be presented at time and headway edge cases, and two source-history qualifications. The critic's findings are evidence-based review notes, not authority to choose owner policy. No final proposal was written or repaired here.

## Issue register

### C-01 — Material incomplete: headway-based static service display

**Locator:** `draft.md`, “Build a stable scheduled board,” the direct-route recommendation, and Validation table (“Review exact operator static timetable” / frequency cases); `discovery.md`, pilot decisions.

GTFS Schedule defines `frequencies.txt` with `exact_times=0` as frequency-based service where trips do not follow a fixed schedule throughout the day; `exact_times=1` describes schedule-based service represented by headways. The draft consistently proposes displaying a published “scheduled time” and tests frequency-trip identity for realtime matching, but it does not say how the static board should behave if the operator export uses `exact_times=0`. In that case a board must not turn a headway or representative template trip into an invented exact departure. No actual export was supplied, so this is a conditional gap, not a finding that the ferry data uses frequencies. See S01 in the source map, “frequencies.txt,” and S02/S03 for realtime matching.

**Reviewer note:** make inspection of `frequencies.txt` and `exact_times` explicit in the proposed static-feed check; leave the presentation choice to the operator/product owners if such service exists. A headway display or another owner-approved representation is a product decision.

### C-02 — Material incomplete: daylight-saving time edge

**Locator:** `draft.md`, “Build a stable scheduled board” and proposed static-feed/version checks; `discovery.md`, “Schedule identity, service day, and time.”

The GTFS Schedule reference defines `Time` from “noon minus 12h” of the service day, effectively midnight except on daylight-saving transition days. The draft correctly distinguishes agency timezone, service date, extended-hour times, and stop timezone. Its validation cases include after-midnight and late/collision cases, but do not cover a daylight-saving transition. A seasonal service could operate on or across a clock-change date; resolving every GTFS time as ordinary local midnight plus seconds is therefore not a safe implicit assumption. See S01, locator “Time,” “agency.txt,” and “stop_times.txt.”

**Reviewer note:** keep this as a proposed edge-case check for the exact export/time zone, not as an executed result or a prescribed local display rule.

### C-03 — Material incomplete: current SIRI schema/version distinction

**Locator:** `source-map.json` S15; `draft.md`, “Analogous schedule-plus-event-stream mechanism” and route comparison.

The SIRI repository currently lists **v2.3** as the latest XML-schema branch with functional improvements, and **v2.2** as the latest branch matching CEN documentation with bug fixes only. It also says to use a release when a schema must match a published CEN document. The investigator correctly keeps SIRI conditional and advises pinning the partner’s national profile, but its S15 record says v2.2 is the current stable branch and characterizes v2.3-wip as development without recording the current v2.3 branch. This leaves version applicability incomplete. The evidence does not establish which branch or release the ferry partner uses, and it does not invalidate the conditional SIRI option. See S15, “Branches” and “Important notes,” as observed 2026-10-10.

**Reviewer note:** distinguish “latest schema branch” from “latest branch matching CEN documentation”; do not select a SIRI release without the partner’s profile.

### C-04 — Material incomplete: current trip relationship coverage

**Locator:** `draft.md`, “Add producer realtime as a separately attributed overlay,” “Released issue/fix history,” and proposed replay cases.

The draft correctly names the May 2025 deprecation of `ADDED` in favor of `NEW`, adds `REPLACEMENT), and conditions support on the partner contract. Its behavior description and test list chiefly cover `ADDED/NEW`, `UNSCHEDULED`, cancellation, skip, and no-data. The current GTFS-RT reference also describes `DUPLICATED` (a copy of a scheduled trip at another service date/time) and `REPLACEMENT` (a replaced scheduled trip with its own complete journey); `UNSCHEDULED` is specifically for `frequencies.txt` with `exact_times=0`. The proposal does not clearly state how it would classify or validate those cases if supplied. See S02, S03, and S07. This is a conditional completeness gap; no partner message inventory was provided.

**Reviewer note:** keep partner confirmation of actual relationships as an owner input and include the relevant cases in proposed validation only when the partner supports them. Do not imply those cases were tested.

### C-05 — Minor locator/wording: OTP PR testing record

**Locator:** `draft.md`, “Released issue/fix history”; `source-map.json` S12/S18.

The PR description says “Unit tests: None,” while the PR’s changed-file list includes a newly added `PollingGraphUpdaterTest`. Direct inspection of commit `69ac485` shows two unit tests: one checks that the feature-on path waits for an asynchronous graph writer, and one checks that the feature-off path returns without waiting. This resolves the apparent contradiction: a narrow feature-behavior test exists, but the PR supplies no performance/load test and no ferry-feed test. The draft notes the discrepancy and does not claim that the test ran, but it should identify this distinction rather than leave the test scope ambiguous. See new source S19 and S12/S18.

## Obligation and released-plan disposition check

| Brief obligation | Review finding |
| --- | --- |
| 1. Two routes plus an analogous mechanism | Covered: direct GTFS adapter/board, OTP-backed API/board, and conditional NeTEx/SIRI. The released plan's trip-ID-only join and “last received” rule are correctly rejected. |
| 2. Static identity, message types, freshness, mismatch, no invented departures | Core explanation is sound: service identity is distinct from a dated trip instance; absent update is not “on time”; freshness guidance is labeled nonbinding; explicit mismatch behavior is marked as a local fail-closed choice. C-01 and C-04 qualify completeness for conditional feed cases. |
| 3. Related identifier, service day/time zone, alert applicability | The draft keeps these semantics distinct and proposes joint validation. C-02 adds a DST transition edge; alerts are matched independently using active range and informed entities. |
| 4. Released consumer history and governed operations/revisions | The #6252 → #6262 → OTP 2.7.0 chain is traced; the issue's OTP 2.7.0-SNAPSHOT/National Rail context and missing static timetable revision are explicit. The v2.10.0 feature default is version-pinned and config override is acknowledged. C-05 refines the test-history wording. |
| 5. Optional staff advisory | Correctly retained as optional and owner-authorized, with duty-manager workflow, attribution, scope, expiry, audit, and retraction conditions. No evidence-based exclusion is asserted; no existing authoring capability is promised. |
| 6. Ownership | Correctly preserves publisher ownership of timetable versions, duty-manager ownership of manual advisories/stale wording, and the partner's obligation to confirm actual realtime coverage. |
| 7. Negative constraints | All four are preserved: no vessel dispatch, no ETA from missing data, no alert-as-trip-update conversion, and no manual notice presented as a feed observation. |
| 8. Coherent evidence-backed proposal and validation status | Draft is coherent and complete at pilot scale. Its validation table separates source research from product checks, and labels product/feed scenarios NOT_RUN or proposed. C-03 is the only material version-applicability caveat for the optional SIRI route. |

## Classification summary

- **Material wrong:** none found in the core proposal after direct source review.
- **Material incomplete:** C-01 headway-based static presentation; C-02 GTFS daylight-saving time edge; C-03 SIRI version distinction; C-04 current TripUpdate relationship coverage.
- **Minor locator/wording:** C-05 OTP unit-test scope.
- **Unsupported:** none judged material. Product choices are generally labeled as inference or local policy, and unresolved external inputs are kept unresolved rather than inferred.
- **Honestly unresolved external input:** exact timetable contents/version and time zone; partner protocol, message coverage and feed-version binding; duty-manager wording/advisory workflow; owner-approved freshness thresholds and display channels.

## Validation and Goal record

Executed in this critic stage: direct read-only retrieval and inspection of cited public primary documentation, release history, issue/PR details, and released source. These are research observations only. No product behavior, local parser, timetable/realtime pairing, pilot UI, or proposed scenario check was executed. Those remain NOT_RUN.

Native Goal activation was directly observed before substantive review: threadId `01a12405-708e-7960-aee8-6bb901d7a6e1`; objective exactly matched `freeze.json.native_goal_objective`; status was `active` at creation; direct tool fields `createdAt` and `updatedAt` were both `1791605727` (epoch seconds). No activation receipt was fabricated. Goal provider/method provenance beyond the directly returned fields was not exposed and is UNKNOWN. Both required science outputs were saved while the Goal was active; terminal completion is performed only after this checkpoint.
