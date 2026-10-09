# Independent verification record — critic stage (A-M08-A, control, M08)

Per-claim verdicts for every consequential claim inventoried in `claim-inventory.md`, re-derived from the retained source roots and from independently re-fetched public primary sources. Access timestamps UTC; fetch window 2026-10-09T21:32Z–21:38Z. Tools: `curl` (raw HTTP with status codes, browser UA where noted), GitHub REST API, WebFetch (rendered text). Evidence snapshots retained in `critic/sources/` (hashes at bottom). Every verdict cites a concrete locator.

## Executed operations (all verification in this stage was fetch/compare only; no code was run)

1. Re-read both retained Timefold files; re-hashed all retained inputs (matched ticket-1 §0).
2. GitHub API `commits?path=` on the old `use-cases/` path — full SHA/author-date/committer-date extraction (11 commits).
3. Individual commit lookups: `47ef6d071b00…`, `d1f5e9c7d4de`, `2c581f3998b8` (author vs committer dates).
4. Raw fetches at 7 refs of the old path (stable, v1.6.0, v1.10.0, v2.0.0, v2.1.0, v2.2.0, v2.3.0) with HTTP status, byte count, line count, sha256.
5. GitHub API `tags?per_page=100` (existence of v2.0.0–v2.2.0), `contents?ref=` probes (repo root and `java/` at v2.2.0), `releases/latest`.
6. Raw fetches of the restructured v2.x path (`java/employee-scheduling/…`) at v2.0.0, v2.1.0, v2.2.0; GitHub API `commits?path=` on that path (5 commits).
7. VolunteerHub home + scheduling pages fetched with browser UA (HTTP 200, full HTML saved as snapshots); exact-phrase greps on the saved HTML.
8. CiviVolunteer docs intro + 2.2 release notes fetched and quote-verified; repo metadata via API (`pushed_at`, commit count via Link header, license field, open issues).
9. OR-Tools employee-scheduling page fetched; 9-point quote check.
10. Timefold API-semantics lookups: docs fairness page (404 retry), javadoc URLs (404), timefold-solver source paths (404) — NOT obtained; recorded as absent.

## Per-claim verdicts

### F1 — stable fairness constraint (retained file)
**VERIFIED (locally).** `EmployeeSchedulingConstraintProvider.java` stable lines 114–122: `forEach(Shift).groupBy(Shift::getEmployee, count()).complement(Employee.class, e -> 0L).groupBy(loadBalance(...))`, `penalizeBigDecimal(HardSoftBigDecimalScore.ONE_SOFT, LoadBalance::unfairness)` (retained file sha `c59fa688…26a4`; re-fetched 21:33:36Z byte-identical). *Caveat stands:* the file shows the calls, not their semantics — see F1-API below.

### F1-API / D1 / D3 — `complement` includes zero-assignment employees; `unfairness` is a spread statistic; BigDecimal required by `penalizeBigDecimal`
**NOT VERIFIED — absent evidence.** All primary-API lookups failed: `docs.timefold.ai/timefold-solver/latest/constraints-and-score/employee-scheduling` → HTTP 404 (21:36:00Z, confirming the research-stage 404); javadoc path `…/javadoc/org/timefold/solver/core/api/score/stream/ConstraintCollectors.html` → 404; `LoadBalance.html` → 404; timefold-solver source at two module-path guesses → 404 (21:36:34Z, 21:37:40Z). The critique must carry these three API-semantics claims as unverified-from-primary-docs (they rest on upstream API behavior the fetched file does not prove).

### F2 — hard/soft constraint set and penalty formulas (retained file)
**VERIFIED (locally).** Lines 39–49 (constraint list), 52–94 (hard constraints with exact penalties: minute overlap `(10*60)-breakLength`, `toLocalDate()` day bucketing, `Shift::getOverlappingDurationInMinutes` for unavailable).

### F3 — naive `LocalDateTime`/`Duration` throughout (retained file)
**VERIFIED (locally).** No zone usage anywhere in stable file (imports lines 7–8: `java.time.Duration`, `java.time.LocalDateTime` only); `oneShiftPerDay` buckets on `shift.getStart().toLocalDate()` (line 82).

### F4 — v1.10.0 differences (retained file)
**VERIFIED (locally).** No balance constraint; `HardSoftScore` import (line 6); `Availability`/`AvailabilityType` imports (lines 12–13); `unavailableEmployee` penalty = full shift duration (`getShiftDurationInMinutes`, line 91); `forEachUniquePair` in `atLeast10HoursBetweenTwoShifts` (line 63) vs stable's `forEach().join()` — confirmed unremarked diff. Retained sha `3c9fc645…6fcb`; re-fetch byte-identical.

### F5 — Timefold chain A metadata (draft §O3 chain A)
**PARTLY VERIFIED, PARTLY REFUTED — material corrections found.**
- **Commit count 11: VERIFIED** (GitHub API, 21:34:09Z). An earlier WebFetch summary in this stage said 10 — the summarizer dropped a row; raw JSON shows 11. Draft correct.
- **SHAs all match:** `47ef6d071b00` (initial add), `d1f5e9c7d4de` (10-hours), `2c581f3998b8` (Duration), `bbab27e92dda` (PLANNER-1709), `ab36b9c36c17` (2.3.0).
- **Draft dates = committer dates, VERIFIED as a consistent convention:** initial add author 2021-11-15T20:37:34Z / committer 2022-01-21T15:33:46Z (draft said 2022-01-21); `d1f5e9c7d4de` author 2022-02-03 / committer 2022-02-07T13:47:19Z (draft 2022-02-07); `2c581f3998b8` author 2022-02-04 / committer 2022-02-07T13:47:19Z (draft 2022-02-07). Locator: GitHub API commits/`<sha>` fields `commit.author.date`, `commit.committer.date`.
- **"No non-release commit after 2022": REFUTED as written** — `0e274a686bbe` 2023-04-20 "Timefold fork step 5: rename packages" is non-release and post-2022 (the draft lists this commit itself, then contradicts it in the inference sentence). Substance survives: the rename is not the fairness addition.
- **"releases/latest returned no Release object": VERIFIED** (HTTP 404, 21:32Z — GitHub's no-releases response).
- **"Tags v2.0.0–v2.2.0 → 404 at this path": VERIFIED literally** (raw old path 404 at all three, 21:33:36Z) **but materially incomplete — see N1.**

### N1 (NEW, material) — fairness constraint existed at v2.0.0; introduction window pinned to mid-2024
The draft's squash inference ("the change presumably arrived inside a squashed release PR", window left open to 2026-07) is **superseded**:
- Repo **restructured**: at v2.2.0 there is no `use-cases/` dir; quickstarts live under `java/<project>` (contents API, 21:35:06Z). The old path 404s at v2.0.0–v2.2.0 **because the path was absent, not because the tags lack the constraint**.
- At the restructured path `java/employee-scheduling/src/main/java/org/acme/employeescheduling/solver/EmployeeSchedulingConstraintProvider.java`: HTTP 200 at v2.0.0, v2.1.0, v2.2.0, **each containing `balanceEmployeeShiftAssignments` (2 occurrences) and byte-identical to stable** (sha256 `c59fa688…26a4` for all three, 21:36:59Z).
- New-path history (GitHub API, 21:37:40Z): first commit `b2056965eb30` 2024-06-19T16:38:09Z "build: release version" → `daeec0c8865f` 1.12.0 (2024-07-09) → `c18de9dfc3ae` 1.13.0 (2024-08-13) → `3dfec2daac17` "build: release version 2.0.0 (#1064)" (2026-04-22) → `ab36b9c36c17` 2.3.0 (2026-07-10).
- **Conclusion:** the constraint demonstrably exists from the file's first appearance on the new path (≤ 2024-06-19, riding the same release/restructure commit) and is unchanged through 2.3.0. Corrected window: between v1.10.0 (2024-05-14, absent) and 2024-06-19 — not "somewhere up to 2026-07". The draft's "evidence-absent" honesty about the exact introducing diff was appropriate, but its implied latest-arrival date was wrong by ~2 years.

### Line-count claims (draft chain A: 112 / 123 / 125)
**REFUTED as counts, convention identified.** `wc -l`: v1.6.0 = **111**, v1.10.0 = **122**, stable = **124** (each exactly one less than claimed; consistent `cat -n`-style final-line convention). Content claims unaffected (F4, F5 above). Locators: `critic/sources/verify-timefold-provider-v1.6.0.java` (sha `0ea6b005…a33e`), retained files, raw fetches 21:33:36Z.

### F6 — OR-Tools page claims
**VERIFIED (9-point check, fetch 21:35Z, page not retained — transcription risk remains for exact wording).**
(1) `min_shifts_per_nurse = (num_shifts * num_days) // num_nurses` present; (2) `max = min+1` when `num_shifts*num_days % num_nurses != 0`; (3) `shift_requests[n][d][s]` 0/1 triples; (4) `add_exactly_one` per (d,s) over nurses, `add_at_most_one` per (n,d) over shifts; (5) objective `model.maximize` of fulfilled-request sum; (6) requests example sets no solver parameters (`CpSolver()` then `solve`); (7) 5,184 solutions figure belongs to the first 4-nurse example, with an "usually not practical to print all" note — matches draft phrasing; (8) enumeration variant `linearization_level = 0`, `enumerate_all_solutions = True`, stops after 5 solutions via callback; (9) main example 5 nurses × 7 days × 3 shifts.
*Precision finding:* the draft's "implicitly assumes everyone is available every day" is imprecise — bands are uniform per nurse and requests are soft, so a nurse requesting nothing can still be assigned up to the band; directionally right, mechanism mislabeled (carry to critique).

### F7 — VolunteerHub quotes
**VERIFIED against live pages (browser-UA fetch 21:36:00Z, HTTP 200 both pages; full HTML snapshots retained).** Exact-phrase grep hits on saved HTML: "recurring shifts in seconds", "Duplicate schedules", "Fill cancellations with waitlists", "confirmations, reminders", "Capacity limits prevent", "approval workflows", "browse events, register", "Requires Orientation", "Requires Background Check", "waitlist" (6 occurrences), "Advanced Permissions" (both pages). *Drift note:* plain WebFetch (bot UA) got HTTP 404 for both pages at ~21:35Z while curl+browser-UA got 200 — access-method-dependent behavior, now documented; the research's 21:17–21:18Z fetches predate my snapshots by ~18 min.
*Not verifiable:* "dominant pattern is the opposite of silent auto-assign" — marketing emphasis does not establish product dominance (carry to critique).

### F8 — CiviVolunteer claims
**VERIFIED (fetches 21:35Z).** Docs intro: "Future plans" lists "recurring volunteer opportunities" among phase-2 ideas (with skill-matching/qualifications, org links, recognition, self-service hours); current features: multiple projects, opportunities "with distinct roles and shifts", "Manually assign volunteers to shifts", hours logging. Release 2.2: VOL-267 "accidental mass deletions of project data", upgrade "strongly recommended"; `api.VolunteerProject.create` auto-creates flexible need and `VolunteerNeed.create` "now throws an exception" on a second flexible need (VOL-269); permissions "Edit Volunteer Project Relationships" / "Edit Volunteer Registration Profiles"; 2.2 defaults "for a project's manager, beneficiary, and other relationships"; custom fields as report columns; **no release date anywhere** (footer years only) — the draft's "undated, bounded by access date" holds.
Repo API: `pushed_at` 2026-10-01T20:14:42Z ✓; commit count 1811 via Link header `page=1811` ✓; `open_issues_count` 47 = 38 issues + 9 PRs (S4's split consistent, exact split not re-derivable from this endpoint alone). *Partial:* GitHub API `license` field is null — the AGPL-3.0 + exception file names were NOT re-verified at file level (carry as minor unverified item).

### F9 — secondhand leads quarantine
**VERIFIED as correctly quarantined.** The claimed-404 docs.timefold.ai fairness URL reproduces 404 (21:36:00Z). timefold.ai catalog pages not fetched in this stage (time budget); critique should weigh O1/O2 relevance of the abandoned docs lead (discoverable-alternative gap) without asserting their content.

### D2, D4, D5, D6
- D2 (penalties in minutes from Duration): **VERIFIED locally** (every penalty lambda ends `.toMinutes()`, stable lines 32/71–76/92/101/110).
- D4 (OR-Tools units): **VERIFIED** per F6(3)(5) — counts/booleans.
- D5 (runtime limits outside file, absent evidence): **VERIFIED as honest** — nothing in the file sets solver limits.
- D6 ("available" changes effective immediately via S7 semantics): **REFUTED as overreach** — the constraint acts at solve time; "immediately" is a product-behavior claim the solver file cannot establish (carry to critique).

## Retained evidence (critic/sources/, sha256, access 21:33–21:36Z)

| File | sha256 |
|---|---|
| verify-timefold-provider-v1.6.0.java | `0ea6b00515ffbc3d43a6048ea1a9f5b02e7467a065cc4b7c86ff6b07f897a33e` |
| verify-timefold-provider-v2.0.0.java | `c59fa688ce725ed41976749c2e9d3935c239da315bebe2b39280624e632226a4` |
| verify-timefold-provider-v2.2.0.java | `c59fa688ce725ed41976749c2e9d3935c239da315bebe2b39280624e632226a4` |
| verify-volunteerhub-home-20261009T2135Z.html | `b6c0710ecdc1e5ea8d31e98c9855d0b7846ca309292dd86f7834ffd7bfbbe892` |
| verify-volunteerhub-scheduling-20261009T2135Z.html | `8977c47d4f9873d6508119cf731d5beb733fed9ecbc25c50207e65f977063185` |

## Summary for the critique

Material findings: **N1** (fairness constraint predates 2.3.0; window pinned to 2024-06-19; draft's implied latest arrival wrong), **F5 wording** ("no non-release commit after 2022" contradicted by the fork-rename commit the draft itself lists), **D6** ("effective immediately" overreach), **F6 precision** (band-availability mechanism mislabeled), **P6 class tension** and other §3–§5 items of claim-inventory.md now evidence-checked. Verified-clean: all SHA attributions, committer-date convention, all locally verifiable code claims, OR-Tools 9-point, VolunteerHub 10-phrase, CiviVolunteer VOL-267/269/permissions/undated status. Unverified (absent evidence, honestly carried): `complement`/`LoadBalance`/BigDecimal API semantics (all doc/source lookups 404), CiviVolunteer license files at file level, S9's exact v1.6.0 line count (111 vs claimed 112), OR-Tools/VolunteerHub/CiviVolunteer exact wording beyond retained snapshots.
