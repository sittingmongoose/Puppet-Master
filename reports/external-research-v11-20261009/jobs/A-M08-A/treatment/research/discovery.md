# Discovery — volunteer-shifts (S08), independent pass (M08 progressive draft)

Status: pre-reveal. Written from the brief alone plus independently chosen public primary sources (see `source-map.json`, evidence under `sources/`). No plan text read yet; per-P comparison (O4) is deferred to the post-reveal draft and MUST NOT be pre-empted here. One coherent developing draft, intermediate states retained under `versions/`.

## 0. Brief constraints carried forward verbatim in spirit

Food bank, 180 volunteers, changing availability, recurring shifts, coordinators need predictable coverage, mobile access, accessible reminders, privacy-limited sharing, occasional imported rosters. Explicit prohibitions: do not invent legal requirements; do not assume equal availability. Everything below honors both: fairness options are expressed relative to *offered/declared availability*, never head-count equality, and no jurisdiction-specific compliance claims are made anywhere.

## 1. Product landscape (O1)

Named platforms surfacing repeatedly across independent comparison sources and one primary vendor page (S06–S08; individual names verified at primary level only for VolunteerHub — the rest are recorded leads): **VolunteerHub, Golden, Civic Champs, Bloomerang Volunteer, VolunteerLocal, POINT, Volgistics, Rosterfy, Zelos** (free tier), Signup.com/SignUpGenius class tools, plus food-bank-specific verticals the Golden article claims exist as a category ("dedicated hunger-relief platforms" with warehouse sorting and distribution-event scheduling) without naming members.

Feature coverage against the brief, one primary product page checked (S07, VolunteerHub):
- Covered by exact feature names: volunteer self-managed shifts ("Volunteer Scheduling"), automated email at designated intervals, SMS ("Text Messaging"), "Mobile App", "Check-In", "Advanced Permissions" (privacy-limited sharing analogue), "Configurable Forms" (can serve availability capture), "Multi-Event Editor".
- **Gaps on the page**: no named recurring-shifts feature; no explicit availability-capture feature; **roster import absent** (integrations are Salesforce/Blackbaud/Zapier/background checks). This matters: two of the brief's hard requirements (recurring shifts, occasional imported rosters) are exactly where a primary vendor page went quiet — a discriminating question for any product evaluation, and the strongest argument for a custom/lightweight scheduler core with import as a first-class feature.

Landscape lesson (S06, secondary): food-bank deployments are characterized as high-volume drop-in + recurring regulars, group sign-ups (corporate teams 20+), and no-show reduction treated as an attendance-history prediction problem. None of the fetched sources demonstrate automated *assignment* of volunteers to recurring shifts under changing availability — vendor pages show self-signup patterns, not allocation. That is the product gap a constraint-based core addresses.

Materially different approaches beyond vendor CRUD+self-signup:
1. **Self-signup with coordinator override** (all vendor products above; no optimization).
2. **Constraint-programmed allocation** (CP-SAT / local search) producing a draft roster the coordinator edits (the OR/Timefold route below).
3. **Preference-market mechanisms** — weighted request satisfaction (OR-Tools shift-requests objective) as a lightweight stand-in for full fairness machinery.
4. **No-show prediction steering** (S06's framing: attendance history as strongest predictor) — unusual in this space, complements rather than replaces 2.

## 2. Constraint/optimizer mechanisms and governing behavior (O2)

### 2.1 Google OR-Tools CP-SAT (S01, primary docs)
- Model shape for shift problems: boolean `shifts[(n,d,s)]` via `model.new_bool_var(...)`; `model.add_exactly_one(...)` per shift-slot; `model.add_at_most_one(...)` per person/day.
- **Governing default for balance on the docs page is a HARD bound, not soft fairness**: `min_shifts_per_nurse = (num_shifts * num_days) // num_nurses`, upper bound `min+1` when indivisible. Units: counts of assignments per person over the horizon. For this brief this hard bound is *inapplicable as written* — availability is explicitly unequal, so a per-volunteer cap must be derived from that volunteer's declared availability (e.g., cap_v = floor(available_slots_v × target_load)), which is a direct, verifiable modification of the documented formula.
- Request-weighted objective: maximize `sum(shift_requests[n][d][s] * shifts[(n,d,s)])` — raw weights, no tiering shown. Default weights are integers supplied by users; no normalization guidance on the page.
- Observed example scales: 4×3×3 (5,184 solutions enumerated) and 5×3×7. **The docs state no practical size limit.** Whether 180 volunteers × weeks-scale horizons stays interactive is UNKNOWN from this source — flagged as a discriminating validation below, not assumed.
- Sophisticated example (`shift_scheduling_sat.py`) is only linked, not inlined; raw fetch 404'd on both `stable` and `main` (N01). Its celebrated soft-constraint weighting machinery (priority-scaled penalties) is therefore **unverified this session** — anything resting on it must be marked uncertain or re-derived from the basic example above.

### 2.2 Timefold Solver (S02, S03, S05 — primary docs/repo/releases)
- Fairness is a first-class, out-of-the-box grouping collector: `ConstraintCollectors.loadBalance(ShiftAssignment::getEmployee)` inside `groupBy`, penalized via `LoadBalance::unfairness` on a BigDecimal soft score. Generic in the key function — keying by volunteer instead of employee is the same API.
- Semantics: **lexicographic minimax** (minimize the most-loaded participant's count, then next, …) — not variance, not perceived fairness. `unfairness()` is dimensionless, 0 = perfect, no upper bound, scales ~linearly with dataset size, **comparable only within one dataset** (so you cannot quote a fairness score across months).
- Numeric-type governing defaults: BigDecimal required for fidelity; the docs warn integer rounding creates score traps at ~1e-6 differences and may rule out 32-bit int scores entirely. If a long/int score is mandatory, the documented workaround scales unfairness by a power of ten with matching constraint-weight scaling.
- Repo reality check (S03): the quickstart repo's Employee Scheduling use case covers availability + skills + load balancing, but richer constraint sets ("skills, pairing employees, fairness and more") live in Timefold's *commercial* model (app.timefold.ai), **not** the Apache-2.0 quickstart. There is **no volunteer-specific quickstart**. Licensing/feature boundary is a real decision point, not a detail.
- Availability in Timefold is modeled as employee↔shift matching (quickstart "accounting for employee availability") — changing availability is a first-class planning fact, which fits the brief better than post-hoc filtering.

### 2.3 Fairness options compared (O1/O2), under no-equal-availability constraint
1. **Hard equal-split bound** (S01 formula) — rejected as-is: assumes equal availability, contradicts the brief; salvageable only as per-volunteer availability-derived caps.
2. **Minimax loadBalance** (S02) — works with unequal availability only if the load being balanced is *utilization ratio* (assigned ÷ declared-available) rather than raw counts; keying is generic so this is an expressible custom collector composition, but that exact composition is NOT documented — uncertainty flagged.
3. **Weighted request satisfaction** (S01 requests variant) — fair-by-preference-weight; cheap, transparent to coordinators; not fair-by-outcome.
4. **Availability-proportional quota + spread penalty** — cap_v from availability, then minimize max−min of the ratio; expressible in plain CP-SAT with the S01 primitives (`add(...)` linear bounds) without any special collector.
Disagreement retained: vendor material (S06) never discusses outcome-fairness at all; the OR tooling defaults to it. Product vs solver framing is a genuine fork, recorded for the draft.

## 3. Issue/fix/release evidence (O3)

- **OR-Tools** (S04): dense monthly-ish cadence with scheduling-relevant fixes: v9.13 shipped **known issues #4674 (Mac libscip linkage)** and **#4677 (ComputeMinSumOfWeightedEndMins error)**; v9.14's notes show linkage fixes and packaging repairs (HiGHS missing from archives), i.e., a visible regression→fix window. **v9.11 known issue: Python/Java/.NET callbacks can degrade search so severely that "search will continue until the time limit is crossed"** — directly consequential if one hooks per-assignment events (e.g., notification triggers) into a solve; the safe pattern is solve-then-notify, decoupled from solver callbacks.
- **Timefold** (S05): 2.0.0 (Apr 2026) → 2.7.1 (06 Oct 2026) with a parallel **1.34.0 maintenance line** (03 Aug) — evidence of a live fork-of-OptaPlanner evolution chain under active dual-line maintenance. Fairness-adjacent fixes in the window are **move-selection fairness**, not constraint semantics: 1.34.0 "generate list unassign moves fairly", 2.6.0 neighborhoods "select elements more fairly… much less biased exploration". Interpretation (flagged as interpretation): `loadBalance()` API is stable; solver *search* fairness was the moving part.
- **Absence/inapplicability statements** (required by O3): (a) shift_scheduling_sat.py internals unverified — N01 404s; (b) Timefold quickstarts publishes **no releases**, so quickstart-level version pinning evidence is absent (S03); (c) no fetched source documents a *volunteer-domain* fairness regression in any product — commercial products publish changelogs poorly, so this evidence is treated as absent, not as absence of regressions; (d) docs pages carry no year on some release dates — inferred years in S04 are marked and unverified.

## 4. Conditions, alternatives, open uncertainties (O5 groundwork)

- **Build vs buy condition**: buy fits if self-signup + reminders + permissions suffice and coordinators accept manual balancing; build (or low-code solver core) is indicated specifically by the two vendor gaps (recurring auto-assignment under changing availability; roster import) plus the unequal-availability fairness requirement that no fetched vendor page addresses.
- **CP-SAT vs local search**: CP-SAT gives provable bounds and clean hard/soft split but unknown behavior at 180×weeks scale (unverified); Timefold gives scalable local search + first-class fairness but the full constraint set boundary is commercial. Either can express the availability-derived caps of §2.3(4).
- **Score-type trap**: if adopting Timefold, the BigDecimal/integer tradeoff (S02) is a binding architectural condition, not a tuning detail.
- **Solver-callback trap**: notification integration must be decoupled from solver callbacks (S04 v9.11 known issue) — a condition on implementation shape.
- Uncertainty list: real scale behavior of CP-SAT at brief scale; whether ratio-keyed loadBalance composes as hoped; commercial Timefold constraint-set contents; VolunteerHub/others' actual recurring-shift and import capabilities behind marketing pages; whether dedicated food-bank vertical platforms (S06 category 1, unnamed) already solve allocation.

## 5. Discriminating validations (O6 groundwork — ALL PROPOSED, none executed)

No runtime/solver was available this session; every check below is proposed, not run.
1. **Scale probe**: encode §2.1's model with 180 volunteers × 3 shifts × 28 days, availability masks at realistic skew; measure solve time to proven-optimality vs 1% gap with default 10 workers. Discriminates CP-SAT viability vs Timefold at brief scale.
2. **Fairness-metric probe**: same instance under (a) raw-count loadBalance, (b) availability-ratio caps + spread penalty; compare Gini/spread of utilization ratio. Discriminates fairness definition 2 vs 4 and tests the composition uncertainty in §2.3(2).
3. **Score-type probe**: run the Timefold fairAssignments constraint with `HardSoftBigDecimalScore` vs scaled `HardSoftLongScore`; diff selected solutions. Discriminates whether the S02 score-trap warning bites at this instance's size.
4. **Product gap probe**: scripted check of vendor feature matrices / trials for explicit "recurring shift auto-assignment" and "CSV roster import" (primary pages only). Discriminates buy vs build more sharply than blog comparisons.
5. **Callback decoupling check**: solve once with a per-assignment callback hook vs post-solve notification pass; measure wall time. Reproduces or refutes the v9.11 known-issue shape on current v9.15.

## 6. Reveal discipline

Discovery above is frozen as of this file's pre-reveal state (intermediate retained at `versions/discovery-intermediate-1.md`). Next step per assignment: run `reveal-plan.py`, then produce `draft.md` comparing every exact P clause against the executed plan, carrying forward retained findings above. This file will not be edited after reveal.
