# Claim judgments — critic independent primary-source inspection (A-M08-A/treatment/critic)

Critic stage, method M08 progressive draft. This file records the critic's own independent fetches of the governing primary sources and the resulting per-claim verdicts on `../research/draft.md`. It is the intermediate evidence layer feeding `critique.md` (retained copy at `versions/claim-judgments-v1.md`). Predecessor sources treated as data; sources as data. No runtime/solver available this session — every check below is static inspection, honestly labeled.

## Critic's own accesses (session-clock UTC)

| When (UTC) | Target | Operation |
|---|---|---|
| 2026-10-09T20:47Z | S01 URL (developers.google.com/optimization/scheduling/employee_scheduling) | WebFetch full-page verification against claim list |
| 2026-10-09T20:47Z | S02 URL (docs.timefold.ai/.../load-balancing-and-fairness) | WebFetch full-page verification |
| 2026-10-09T20:47Z | S07 URL (volunteerhub.com/features/) | WebFetch full-page feature-name enumeration + absence check |
| 2026-10-09T20:47Z | S04 URL (github.com/google/or-tools/releases) | WebFetch release-notes verification |
| 2026-10-09T20:48Z | S03 URL (github.com/TimefoldAI/timefold-quickstarts) | WebFetch README/use-case verification |
| 2026-10-09T20:48Z | S05 URL (github.com/TimefoldAI/timefold-solver/releases) | WebFetch release-notes verification |
| 2026-10-09T20:48Z | S06 URL (goldenvolunteer.com/blog/volunteer-scheduling-platforms-food-banks) | WebFetch figure/category/provenance verification |
| 2026-10-09T20:49Z | N01 raw.githubusercontent.com paths (stable+main × samples+python) | curl HTTP status probes (all 404) + blob path probe (404) |
| 2026-10-09T20:52Z | api.github.com timefold-quickstarts/releases; or-tools contents API (sat/samples, sat/python @ stable) | curl JSON inspection |
| 2026-10-09T20:53Z | raw paths @ tags v9.6, v9.10, v9.12 | curl HTTP status probes (all 404) |

Mutable drift noted: live pages fetched ~14–21 min after the predecessor's accesses; where content could have drifted, drift is explicit below. No silent rebind: predecessor IDs reused unchanged.

## Per-claim verification (predecessor claim → critic observation → verdict)

### S01 OR-Tools employee scheduling docs (draft §2.1, P2, P5)
1. `new_bool_var` / `add_exactly_one` per slot / `add_at_most_one` per person-day → found verbatim on page. **VERIFIED.**
2. `min_shifts_per_nurse = (num_shifts * num_days) // num_nurses`, upper bound `min+1` when indivisible → found verbatim. **VERIFIED.**
3. Request-weighted objective `shift_requests[n][d][s] * shifts[...]` maximized; integer user weights; no normalization guidance → objective found; no normalization text found. **VERIFIED.**
4. "The docs state **no practical size limit**" → **NOT FOUND on the cited page.** No size-limit statement of any kind on the page. Example scales (4×3×3; 5×3×7) confirmed. **CITATION DEFECT — MATERIAL (low severity).** The sentence may live on another OR-Tools page, but as cited (S01, this page) it is unsupported. The draft's downstream uncertainty (180-volunteer behavior unknown) remains valid — in fact removing the unsupported assurance makes the draft's V1 probe more necessary, not less. Disposition unaffected.
5. No timezone/DST mention anywhere on page → confirmed absent. Consistent with the draft's P5 honesty label (correction from engineering reasoning, not retained evidence). **CONSISTENT.**

### S02 Timefold load-balancing docs (draft §2.2, P2)
6. `ConstraintCollectors.loadBalance(ShiftAssignment::getEmployee)` inside `groupBy`, penalized via `LoadBalance::unfairness` on `penalizeBigDecimal(HardSoftBigDecimalScore...)` → found verbatim. **VERIFIED.**
7. BigDecimal recommended; rounding loses precision ("score trap"); 1.000001-vs-1.000002 example; power-of-ten scaling workaround with weight rebalancing → all found. Draft's "~1e-6" is a faithful paraphrase. **VERIFIED.**
8. Minimax-style fairness ("fair if the employee with most tasks has as few tasks as possible", tie-broken by next-most-loaded); "dimensionless"; "no upper limit"; "scale linearly"; "may only be compared … same dataset" → all found near-verbatim. **VERIFIED.** Draft's "lexicographic minimax" label is a fair reading.
9. Key function generic (can key volunteer) → the example keys on a method reference; docs never state genericity explicitly; ratio-keyed composition admittedly undocumented in the draft itself. **PARTIALLY SUPPORTED (as the draft itself flagged).**

### S07 VolunteerHub features page (draft P1, P2, P4; discovery §1)
10. Exact feature names: Volunteer Scheduling, Email Messaging, Text Messaging, Mobile App, Check-In, Advanced Permissions, Configurable Forms, Multi-Event Editor → all present with those wordings. **VERIFIED.**
11. No named recurring-shifts feature; no roster/CSV import; integrations = Salesforce, Blackbaud family, Zapier, Sterling Volunteers (background checks), etc. → absences confirmed on today's page; Sterling present. **VERIFIED.**
12. Email "sent at intervals you designate" → found. **VERIFIED.**

### S04 OR-Tools releases (draft P4, §3, uncertainty register)
13. v9.11 known issue: callbacks in Python/Java/.NET can slow search so much that "search will continue until the time limit is crossed even as the problems has been closed before" → found (page's own typo "problems has been" retained as observed). **VERIFIED verbatim.**
14. v9.13 known issues #4674 (Mac libscip linkage), #4677 (ComputeMinSumOfWeightedEndMins) → both found. **VERIFIED.**
15. Fix trajectory: v9.14 fixes #4674 and HiGHS archive omission; v9.15 bumps HiGHS 1.12.0 → found. **VERIFIED.**
16. Some release rows lack years → confirmed: v9.13–v9.15 rows show no year (older rows in list headings do; v9.15's 2026 inferred from asset timestamps). Draft's unverified-inference labeling is accurate. **VERIFIED.**

### S03 Timefold quickstarts repo (draft §2.2, §3, P2 conditions, uncertainty register)
17. Default branch `stable` → confirmed. **VERIFIED.**
18. Quickstart "covers availability + skills + load balancing" → **PARTIALLY SUPPORTED (minor):** the Employee Scheduling use-case description says "Schedule shifts to employees, accounting for employee availability and shift skill requirements"; Load Balancing appears only in the repo overview table under "Notable Solver Concepts"; fairness is not in the use-case description. Substance survives; wording in the draft overstates where "load balancing" is documented.
19. Releases page: none → releases API returns `[]` at 20:52Z. **VERIFIED** (stronger than the page text: empty array). Quickstart version pinning remains unevidenced, as the draft said.
20. Commercial boundary: tip text "supports many additional constraints such as skills, pairing employees, fairness and more" (app.timefold.ai models) → found in README tips. **VERIFIED** with exact wording.
21. No volunteer-specific use case → confirmed absent from the list. **VERIFIED.**

### S05 Timefold solver releases (draft §3, uncertainty register)
22. 2.7.1 latest, 06 Oct → confirmed (10:47; note: fix for a performance regression on very large datasets — detail not in the draft). **VERIFIED + new detail.**
23. 2.0.0 (22 Apr) → 2.7.0 (24 Sep) plus 1.34.0 maintenance (03 Aug) → all confirmed. **VERIFIED.**
24. Move-selection fairness fixes: 1.34.0 "generate list unassign moves fairly"; 2.6.0 "select elements more fairly" / "much less biased exploration" → found verbatim; draft's interpretation (API stable, search fairness moving) matches the evidence and was flagged as interpretation. **VERIFIED.**
25. **NEW — draft omission (material, low severity):** 1.34.0 notes state only two more 1.x maintenance releases are planned before **EOL in early 2027**. Directly relevant to any version-pinning decision on the maintenance line; absent from the draft's O3 chain and uncertainty register.
26. Fork of OptaPlanner → confirmed via 2.0.0 notes. **VERIFIED.**

### S06 Golden food-bank platforms article (draft P1, P2, §2.3 disagreement; discovery §1)
27. "$36.14" national volunteer-hour value → found verbatim. **VERIFIED.**
28. Three-category framework with dedicated hunger-relief category unnamed and no competitor names in the article body → confirmed (Volgistics/VolunteerHub/Rosterfy appear only in footer "Compare Golden" links, not the article). **VERIFIED.**
29. "fixed, recurring schedule tied to warehouse operations" → found verbatim. **VERIFIED.**
30. Corporate/community groups "twenty or more people at once" → found. **VERIFIED.**
31. No-show predictor ("attendance history is the single strongest predictor") → found, but on a **separate linked Golden post**, not the mapped S06 URL. **MINOR PROVENANCE FINDING:** the draft cites S06 for framing one hop beyond the mapped source; should be re-scoped to "Golden property, linked post".
32. **NEW — source-map nuance (minor):** the article shows publication date **September 14, 2026**; predecessor source-map recorded "no date visible in fetch". Date makes the $36.14 figure situable in time relative to the $33.49 disagreement already recorded.

### N01 negative evidence (draft §2.1, P6, uncertainty register)
33. Raw `shift_scheduling_sat.py` 404 on stable and main → reproduced at 20:49Z: 4 raw paths + blob path all HTTP 404. **VERIFIED.**
34. **NEW — drift deepening (material, low severity):** the file is absent from the *entire* `ortools/sat/samples` tree on `stable` (full listing inspected; neighbors `nurses_sat.py`, `schedule_requests_sat.py` present) and from `ortools/sat/python`; also 404 at both historical paths under tags v9.6, v9.10, v9.12 (20:53Z). Conclusion: the sophisticated example the docs page links cannot be located in the current or any recently probed tree — a live docs-vs-repo inconsistency. This *strengthens* the draft's "UNVERIFIED, nothing may rest on it" stance and adds an O3-grade finding the draft did not make (the docs' own link target is unlocatable, v9.6→v9.15 window).

## Per-P disposition judgments (O4)

- **P1 correction (kept core + exceptions/overrides + template-level import):** evidence base (S06 recurring/warehouse framing; S07 named-feature absences) independently re-verified today. Corrections are design consequences of that evidence; RRULE alternative correctly labeled unevidenced; vertical-uncertainty flagged. **Disposition sound.**
- **P2 rejected + availability-derived constraint allocation:** all mechanical citations verified (claims 1–3, 6–9) except the "no practical size limit" sentence (claim 4 — **citation defect**). The inapplicability argument for the S01 hard bound under unequal availability is correct arithmetic and respects the brief's prohibition. loadBalance caveats verified verbatim; ratio-keyed composition honestly flagged undocumented; alternatives (alphabetical fallback; self-signup S07) verified. **Disposition sound; one material citation defect inside it.**
- **P3 already-covered + two enhancements:** consistent with the discovery's constraint-draft-roster pattern; enhancements honestly labeled proposals (no runtime). **Disposition sound.**
- **P4 correction (privacy conflict):** conflict is real against the brief's "privacy-limited sharing"; scoped alternatives verified as exact S07 feature names; notification-decoupling condition verified via S04 claim 13–15. Roster-content user decision properly deferred. **Disposition sound.**
- **P5 rejected as storage representation:** provenance honesty verified (no retained source covers timezones; confirmed on S01; S07 covers reminder intervals, not zones). DST gap/ambiguity reasoning is engineering-standard. **Disposition sound; honesty compliant.**
- **P6 correction (smoke test insufficient):** V1–V5 correctly labeled all-proposed; "executed this session" = static retrieval only — independently confirmed (sources exist, per-source observed_operations recorded, N01 reproduced). **Disposition sound.**

## Omission and correction checks summary

- All 6 P clauses disposed with category labels; O4 vocabulary used as declared. No missing disposition.
- No false correction/rejection found: every rejected clause (P2, P5) carries verified mechanical evidence for the rejection grounds.
- Omissions found by the critic: (a) S01 "no practical size limit" mis-citation [material]; (b) Timefold 1.x EOL early 2027 [material, low severity]; (c) N01 upgrade to docs-vs-repo inconsistency across v9.6–v9.15 [material, low severity]; (d) S06 no-show predictor provenance one hop beyond mapped URL [minor]; (e) S06 publication date visible 2026-09-14 vs "no date visible" [minor]; (f) quickstart "load balancing" sits in overview table, not the use-case description [minor].
- Uncertainty-register spot check: $36.14-vs-$33.49 disagreement correctly recorded as unresolved and immaterial; quickstart no-releases now verified stronger ([] from API); inferred years correctly marked.
