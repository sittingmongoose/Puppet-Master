# Claim inventory — critic stage working document (A-M08-A, control, M08)

Working ingestion record for ticket 1. Inputs read in full: `assignment.md`, `input-map.json`, `cases/S08/brief.md`, predecessors `research/draft.md`, `research/discovery.md`, `research/source-map.json`, `research/revealed-plan.md`, and `research/sources/` (2 retained Timefold files). This file catalogues every claim the critique must challenge; it is not the critique itself.

## 0. Ingestion verification (executed in this stage)

| Check | Result |
|---|---|
| All 7 declared input paths exist, non-empty (`test -s`) | PASS |
| brief.md sha256 = `cc962dde…e73cf` (matches source-map S1 and discovery header) | PASS (recomputed) |
| discovery.md sha256 = `9d2798f9…19384` (matches draft header "frozen discovery") | PASS (recomputed) |
| stable-2.3.0.java sha256 = `c59fa688…26a4` (matches S7) | PASS (recomputed) |
| v1.10.0.java sha256 = `3c9fc645…6fcb` (matches S8) | PASS (recomputed) |
| revealed-plan.md P1–P6 text identical to draft §"Revealed plan (verbatim)" | PASS (string-compared) |
| source-map.json parses as JSON | PASS |
| **Line counts**: draft claims v1.10.0 = 123 lines, stable = 125 lines; `wc -l` gives 122 / 124 | MINOR ANOMALY (off-by-one; likely trailing-newline/counting convention — check in critique) |
| S9 (v1.6.0, claimed 112 lines, balance absent) not retained on disk | not locally re-verifiable; re-fetch decision belongs to critique |

Scope guards confirmed: write root = `critic/` only; no campaign/history/evaluator read performed; sources to be treated as data.

## 1. Consequential source-backed facts (each needs independent challenge)

**F1 (S7, locally verifiable in retained file).** stable/2.3.0 `balanceEmployeeShiftAssignments` uses `forEach(Shift).groupBy(employee, count()).complement(Employee.class, e -> 0L).groupBy(loadBalance(...))` penalized `HardSoftBigDecimalScore.ONE_SOFT` via `LoadBalance::unfairness` — verified at lines 114–122 of the retained file. Draft's claim that zero-assignment employees enter the fairness statistic rests on the `complement` semantics; that semantics is Timefold API behavior, NOT verifiable from this file alone (the file shows the call, not its effect).

**F2 (S7).** Hard constraints: `requiredSkill`, `noOverlappingShifts` (minute-overlap penalty), `atLeast10HoursBetweenTwoShifts` (`(10*60) - breakLength`), `oneShiftPerDay` (equality on `getStart().toLocalDate()`), `unavailableEmployee` (penalty = `Shift::getOverlappingDurationInMinutes` vs `Employee::getUnavailableDates`). Soft: undesired/desired day (overlap minutes), fairness. All confirmed in retained file.

**F3 (S7, locally verifiable).** Whole file computes in `LocalDateTime` + `Duration` with no zone anywhere; `oneShiftPerDay` buckets by `toLocalDate()` derived from a naive local datetime. Supports the draft's "solvers quietly assume naive local time" (P5) — but note the draft's DST drift narrative ("9:00 becomes 8:00 or 10:00 if instants are mis-stored") conflates two distinct failure modes (wrong conversion at template expansion vs stored-instant reuse across DST); critique should test the phrasing.

**F4 (S8, locally verifiable).** v1.10.0 has NO balance constraint, uses `HardSoftScore`, models availability as separate `Availability`/`AvailabilityType` classes, and its `unavailableEmployee` penalty is the FULL shift duration (`getShiftDurationInMinutes`), not overlap minutes. Draft O2/chain-A claims match the retained file. Also: v1.10.0's `atLeast10HoursBetweenTwoShifts` uses `forEachUniquePair` while stable uses `forEach().join()` — behaviorally near-equivalent pairing change, unremarked in the draft (minor).

**F5 (S7/S8 chain A — needs re-fetch or honest uncertainty).** Claims NOT locally verifiable: 11-commit path history; initial add `47ef6d071b00` 2022-01-21; release bump `ab36b9c36c17` 2026-07-10 "2.3.0"; balance absent in v1.6.0 (112 lines); tags v2.0.0–v2.2.0 → HTTP 404 "at this path"; `releases/latest` returns no Release object; commit search for `complement` = 0 results; inference "presumably arrived inside a squashed release PR". Challenge angles: 404-at-path could mean the file moved between tags rather than tags being absent — the draft hedges ("recorded as unknown") but the critique should say whether a v2.0.0–v2.2.0 tag listing (one API call) would settle it; the squash inference is an inference, not evidence.

**F6 (S10 — page not retained).** OR-Tools claims: `min_shifts_per_nurse = (num_shifts * num_days) // num_nurses`; max = min or min+1 per divisibility; `shift_requests[n][d][s]` 3D binary; `add_exactly_one` per (d,s); `add_at_most_one` per (n,d); objective = maximize fulfilled requests (unit weight 1); defaults (no `max_time_in_seconds`/`num_workers`); enumeration variant `linearization_level=0`, `enumerate_all_solutions=True`, stops at 5 solutions; 5 nurses × 3 shifts × 7 days; "5,184 schedules usually not practical". No sha256, no snapshot retained for this page — every F6 quote rests on the research stage's transcription. Challenge: at minimum re-fetch the page; also challenge the draft's inference that the band formula "implicitly assumes everyone is available every day" — precisely, the bands are uniform per nurse and requests are soft preferences, so a nurse with zero requests can still be force-assigned up to the band; the draft's wording is directionally right but imprecise about the mechanism.

**F7 (S2/S3 VolunteerHub — live marketing pages, not retained).** Quoted features: self sign-up ("browse events, register, and manage their own schedules"), capacity limits, waitlists ("Fill cancellations with waitlists"), "Create recurring shifts in seconds", "Duplicate schedules, reduce repetitive admin work", auto "confirmations, reminders, and follow-ups" with customizable timing and "email or optional text messages", approval workflows, org-defined self-cancellation rules, mobile app + on-site check-in, auto-grouping ("Requires Orientation," "Requires Background Check"), "Advanced Permissions", availability in volunteer DB, integrations (Salesforce/Blackbaud/Zapier). Challenge: none of these pages are snapshotted or hashed — mutable drift is unbounded and unrecorded; "VolunteerHub's dominant pattern is the opposite of silent auto-assign" is an inference from marketing copy, not an observed product behavior (marketing emphasis ≠ dominant pattern); all algorithmic semantics (waitlist ranking, recurrence expansion) correctly recorded as unpublished.

**F8 (S4–S6 CiviVolunteer — live docs, not retained).** Claims: AGPL-3.0 + exception files; repo head pushed 2026-10-01T20:14:42Z, 1811 commits, 38 open issues, 9 open PRs; docs "Future plans" lists recurring opportunities (with skill-matching, self-service hour logging); VOL-267 "accidental mass deletions of project data" (upgrade "strongly recommended"); VOL-269 `VolunteerNeed.create` throws on second flexible need, `VolunteerProject.create` auto-creates one; permissions `Edit Volunteer Project Relationships` / `Edit Volunteer Registration Profiles`; 2.1→2.2 evolution of project relationship defaults. Pages undated — recency bounded only by access 2026-10-09 (draft states this). Same no-snapshot drift exposure as F7.

**F9 (secondhand notices).** Schedly, Rosterfy, Better Impact, Volgistics, SignUpGenius, Zelos, Serve.love, Baeldung, app.timefold.ai constraint catalog ("Balance shift count", "Balance time worked"), docs.timefold.ai fairness page (404 on first URL, "not pursued"). Correctly quarantined as leads. Challenge: the timefold.ai constraint catalog and docs fairness page are directly relevant to O2 (governing defaults for fairness) — abandoning after one 404 without trying the docs index is a discoverable-alternative gap the critique should weigh (O1/O2 relevance), though not a correctness error.

## 2. Governing defaults / units / types claims (O2) to challenge

- D1: Score type `HardSoftBigDecimalScore`; `BigDecimal` required by `penalizeBigDecimal`/`LoadBalance` — second half is an API constraint claim, not verifiable from the retained file.
- D2: "all time penalties in minutes (int) derived from Duration" — verified in retained file (all penalty lambdas end in `.toMinutes()`).
- D3: "fairness unit: LoadBalance::unfairness (real-valued spread statistic)" — the file shows the call; "spread statistic" characterization comes from API knowledge, unverified.
- D4: OR-Tools units: objective in fulfilled-request counts, bands in integer shifts — transcription-based (F6).
- D5: "solver runtime limits live outside this file (not observed — recorded as absent evidence)" — honest; verify it stays honest in critique.
- D6: Draft P2 correction (1) cites S7 "Unavailable employee" as template for "change effective immediately" — nuance: the constraint only takes effect on the next solve; "immediately" is a product-behavior claim the solver evidence does not by itself establish. Challenge this.

## 3. Every P disposition (draft disposition summary) — items to challenge

- **P1** "already-covered pattern (product precedent) + conditional; needs timezone/DST and end-condition corrections". Challenge: "already-covered" vs the discovery's own finding that CiviVolunteer does NOT ship recurrence — coverage precedent is VolunteerHub marketing only; is "already-covered pattern" the right O4 class, or does the correction load make this "rejected as stated, corrected"? Conditions (IANA pin, expansion fork, capacity/role on template, skip/holiday) look sound; "Both solver sources model concrete dated shifts" is a code-level inference (F2/F3 support it).
- **P2** "rejected as sole mechanism; correction: deterministic fallback inside fairness-aware policy; user decision auto vs self-signup". Challenge: alphabetical-bias claim is unsourced reasoning (acceptable if labeled); D6 "effective immediately" nuance; "Availability-normalized fair queue (round-robin over per-volunteer available capacity)" is a retained alternative the sources do not support — draft labels it open design point (honest); verify the recommendation is clearly separated from evidence.
- **P3** "already-covered; conditional (re-validation); optional volunteer-initiated swaps". Challenge: "Uncertainty: None material" is the only P with zero uncertainty — audit-trail requirement (condition 3) is asserted with no source; "CiviVolunteer's whole permission model is relationship-based" overstates S5–S6 (they show relationship-based management, not the whole model).
- **P4** "rejected as stated; correction: targeted reminders + permission-gated roster; user decisions on shift-mate visibility". Challenge: rejection rationale says broadcasting "publishes everyone's contact info" — a roster need not include contact info; the correction stands, but the stated privacy ground is broader than the evidence (privacy mechanisms F7/F8 support gated visibility, not the contact-publication claim specifically). Plain-text/HTML accessibility correctly recorded as absent evidence, no WCAG invention — verify no invention crept in.
- **P5** "rejected as storage model; correction: UTC instants + IANA zone; wall-clock as presentation". Challenge: failure-mode narrative phrasing (F3); "expand recurring templates in the zone, not in UTC" is sound and consistent with P1 condition 1 — check cross-consistency.
- **P6** "already-covered as smoke test; optional enhancement: discriminating scenarios; executed = fetches only". Challenge: classification tension — once P1/P5 corrections introduce DST-zone semantics and P2 introduces a fairness mechanism, DST and fairness tests become validation of REQUIRED corrections, not merely "optional enhancements"; O4's class taxonomy may demand "correction" here. Executed-vs-proposed separation is preserved (§"Executed in this stage") — verify the critique does not blur it; the five proposed tests each name a discriminated design choice (check specificity claims hold); none can run in this stage (no runtime) — proposals must remain proposals per assignment.

## 4. Omissions / completeness gaps to challenge

- O-A: No snapshots or hashes for any live page (S2–S6, S10); only S7/S8 files retained. Drift exposure for the whole marketing/docs evidence base.
- O-B: Mobile access and on-site check-in evidence (F7) never surfaces in any P disposition or the consolidated decisions — brief lists mobile access as a requirement; draft's consolidated section covers 6 user decisions, none about mobile.
- O-C: Roster import appears only as P6 proposed test (3); no design note on import identity/dedupe/consent despite being a named brief requirement (discovery O5 carries it; the draft's self-contained final should restate it per O5 — check whether the draft's own text is self-contained without discovery).
- O-D: 180-volunteer scale appears only via discovery O5; draft never restates scale limits (O5 self-containment question again).
- O-E: Fairness-introducing release never pinned (F5) — an available check (release notes / tag listing / blame on stable) is unexplored; critique should say whether O3 demands it or whether "evidence-absent" is honestly terminal.
- O-F: timefold.ai primary docs abandoned after one 404 (F9).
- O-G: S9 v1.6.0 not retained — earlier-chain evidence is single-witness (v1.10.0) plus an unretained grep claim.

## 5. Corrections / rejections summary to re-adjudicate in critique

| P | Draft disposition | Critique posture |
|---|---|---|
| P1 | already-covered + conditional | challenge class choice (see §3 P1) |
| P2 | rejected as sole mechanism + correction + user decision | challenge D6 immediacy, bias-labeling, normalized-fairness honesty |
| P3 | already-covered + conditional + optional | challenge "no material uncertainty", "whole permission model" overstatement |
| P4 | rejected as stated + correction + user decisions | challenge contact-info ground breadth |
| P5 | rejected as storage model + correction | challenge failure-mode phrasing; check P1/P5 consistency |
| P6 | already-covered + optional enhancement | challenge enhancement-vs-correction class (see §3 P6) |

## 6. Validation applicability (O6) to challenge

- V1: DST recurrence test — "assert local wall-clock stability" needs zone + expected values named to be discriminating as claimed.
- V2: Fairness discrimination — "available 4×" needs an operational definition (denominator) or it cannot discriminate raw vs normalized fairness as claimed.
- V3: Import round-trip — needs a concrete import path to be runnable; correctly proposed-only.
- V4: Permission probe and V5 screen-reader pass — require built system/templates; correctly proposed-only.
- Check all five remain labeled proposed (no runtime in this stage) and that executed checks are limited to retrievals/verifications recorded in research source-map + this stage's ingestion checks (§0).
