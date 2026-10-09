# Predecessor reading notes — A-M08-A control reviser (ticket 1)

Recorded 2026-10-09 after reading the exact brief and all 7 declared predecessors from
input-map.json. Notes only; the reviser writes nothing outside its own stage directory.

## 0. Brief — cases/S08/brief.md (sha256 cc962dde…e73cf, S1)

Food bank, 180 volunteers, changing availability, recurring shifts, coordinators who need
predictable coverage; mobile access, accessible reminders, privacy-limited sharing,
occasional imported rosters. Investigate competing products, constraints/optimizers,
fairness options, with implementation/version evidence. Hard constraints: do not invent
legal requirements; do not assume equal availability. Obligations O1–O6: O1 independent
discovery beyond thin plan; O2 primary-source/code governing defaults, units/types, limits;
O3 at least one issue/fix/regression/release chain, absent evidence stated; O4 compare every
exact P clause with full disposition taxonomy (correction / optional enhancement / user
decision / already-covered / rejected / uncertain); O5 one self-contained coherent final,
text not replaced by IDs; O6 discriminating validations, executed separated from proposed,
honest about no runtime.

## 1. research/revealed-plan.md (frozen thin plan)

P1 weekly-template recurring shifts; P2 first-available volunteer alphabetically; P3
coordinator name swaps; P4 email everyone the full roster; P5 local wall-clock timestamps;
P6 test one ordinary week.

## 2. research/discovery.md (frozen, sha256 9d2798f9…19384, S1–S10)

Written pre-reveal; not rewritten after. O1: four architecture families — (1) VolunteerHub
commercial self-signup marketplace (waitlists fill cancellations; registration-triggered
group placement; recurring shifts; confirmations/reminders email+optional text; Advanced
Permissions; availability in volunteer DB); (2) CiviVolunteer open-source CiviCRM extension
(AGPL-3.0; relationship-based management; recurring opportunities only under "Future
plans" — absent in shipping product); (3) Timefold quickstart `employee-scheduling` — hard
constraints (requiredSkill, no overlapping shifts, 10h rest `(10*60)-breakLength`, one
shift/day, unavailable employee) + soft `balanceEmployeeShiftAssignments` with
`complement(Employee.class, e -> 0L)` and `LoadBalance::unfairness`,
`HardSoftBigDecimalScore`; (4) OR-Tools CP-SAT quota bands
`min_shifts_per_nurse=(num_shifts*num_days)//num_nurses`, soft request maximization,
add_exactly_one/add_at_most_one. O2: units/types/defaults per family; OR-Tools band formula
implicitly assumes uniform availability (caveat recorded). O3: chain A Timefold fairness
constraint (v1.6.0/v1.10.0 absent, stable present; introducing commit not identified — tags
v2.0.0–v2.2.0 404 at the old path); chain B CiviVolunteer 2.2 VOL-267 mass-deletion bug +
VOL-269 API exception, permissions/defaults evolution, release pages undated; chain C
OR-Tools absent by design (stated). O5: retained constraints (180 volunteers, changing
availability first-class, mobile, privacy mechanisms, import surface), alternatives (spread
metric vs quota bands vs product process), genuine tension (neither source normalizes
fairness by availability — open design point). O6: five proposed discriminating validations
(fairness normalization toy instance, DST recurrence expansion, reminder accessibility,
import round-trip, permission probe) — NOT executed, no runtime; executed = source
fetch/verify only.

## 3. research/draft.md (complete post-reveal draft; the reviser's base text)

Per-P dispositions: P1 already-covered pattern + conditional (IANA-timezone pinning, DST
semantics, expansion horizon fork, capacity/role on template, skip rules); P2 rejected as
sole mechanism (alphabetical bias), correction = deterministic tiebreak inside
fairness-aware policy, user decision auto vs self-signup, alternatives (availability-
normalized queue, seeded lottery, self-signup+waitlist, CP-SAT/Timefold); P3 already-covered
+ conditions (re-validate capacity/role/double-booking/availability, permission granularity,
audit trail) + optional volunteer-initiated swap requests; P4 rejected as stated (privacy
+ noise), correction = targeted per-shift reminders + permission-gated roster views, user
decisions (shift-mate visibility, timing/channels, SMS opt-in, broadcast digest); P5
rejected as storage model, correction = UTC instants + IANA zone, wall-clock presentation
only; P6 already-covered smoke + five proposed discriminating tests, executed/proposed
separation explicit. Consolidated six user decisions; uncertainty register (waitlist
ranking/recurrence expansion unpublished; exact Timefold introducing commit unidentified;
CiviVolunteer undated; reminder accessibility unevidenced; fairness normalization
unsupported by sources).

## 4. critic/critique.md (independent review; findings only)

9 material findings the reviser must each accept/amend/reject/retain-uncertainty:
M1 constraint arrival window superseded — exists from ≤2024-06-19 at restructured `java/`
path (v2.0.0–v2.2.0 byte-identical to stable); exact introducing diff still undecomposed.
M2 draft sentence "no non-release commit after 2022" contradicted by fork-rename commit
`0e274a686bbe` (2023-04-20) the draft itself lists; substance survives.
M3 "change effective immediately" is overreach — solver constraints act at next solve;
narrow to "single source of truth + re-solve on change", immediacy = design requirement.
M4 DST-recurrence and fairness-discrimination tests are corrections-validation (mandatory),
not optional enhancements (P6 classification tension).
M5 P4 ground narrowed — roster need not carry contact info; evidence supports gated
visibility + targeted reminders, not the contact-publication claim; "dominant pattern"
marketing-emphasis overreach also flagged.
M6 OR-Tools mechanism mislabeled — bands are uniform per nurse and requests are soft, so
availability never binds the model (precise statement to use).
M7 research-stage live-page evidence unretained/no hashes; drift concrete (VolunteerHub
bot-UA 404 vs browser-UA 200 ~18 min later); critic retained snapshots C11/C12, quotes
verified.
M8 strongest fairness claim (`complement` zero-inclusion, `LoadBalance::unfairness` spread,
BigDecimal requirement) rests on unverified API semantics — all primary lookups 404; must
stay labeled unevidenced.
M9 draft self-containment gap — mobile access, on-site check-in, import identity/dedupe,
180-volunteer scale, reminder-accessibility absence live only in discovery; final must
restate them.
Minor: m1 line counts 111/122/124 (off-by-one convention); m2 committer-date convention
should be named; m3 "whole permission model is relationship-based" overstates; m4 unremarked
`forEachUniquePair`→`forEach().join()` diff; m5 P3 "none material" uncertainty while
audit-trail condition unsourced; m6 timefold docs lead abandoned without index try; m7
AGPL license files not file-level re-verified; m8 S9 now retained by critic (C3); m9
OR-Tools/VH/CV wording beyond snapshots transcription-only.
Rejected critic demands (invalid): exact introducing commit demand; running validations;
reversing P4 rejection; inventing WCAG requirements; critic rewriting text.
P-disposition verdicts: keep all classes; narrow P2 (M3) and P4 (M5); reclass two P6 tests
as correction-validation (M4); strike P3 "none material" (m5); P5 failure-mode narrative to
separate wrong-conversion vs instant-reuse drift (F3).

## 5. critic/verification.md (per-claim record)

Fetch window 21:32–21:38Z, fetch/compare only. VERIFIED locally: F1 stable fairness
constraint lines 114–122; F2 hard/soft set and penalty formulas; F3 naive
LocalDateTime/Duration, no zone usage; F4 v1.10.0 diffs (no balance, HardSoftScore,
Availability classes, full-shift unavailable penalty, forEachUniquePair). F5 chain A
metadata: 11 commits + SHAs + committer-date convention VERIFIED; "no non-release commit
after 2022" REFUTED as written; releases/latest 404 VERIFIED; v2.0.0–v2.2.0 old-path 404
VERIFIED literally but incomplete → N1. N1 (material, new): repo restructured at v2.x
(`java/` layout, no `use-cases/`); provider at v2.0.0/v2.1.0/v2.2.0 byte-identical to
stable (sha c59fa688…26a4); new-path first commit `b2056965eb30` 2024-06-19 → constraint
exists from ≤2024-06-19, unchanged through 2.3.0; corrected window v1.10.0 (2024-05-14,
absent) → 2024-06-19. Line counts REFUTED as counts (111/122/124, convention identified).
F6 OR-Tools 9-point VERIFIED; precision finding = M6. F7 VolunteerHub quotes VERIFIED
against browser-UA snapshots; access-method-dependent serving documented; "dominant
pattern" not verifiable. F8 CiviVolunteer VERIFIED (VOL-267/269, permissions, undated
pages, pushed_at 2026-10-01, 1811 commits); license field null — file-level not re-verified.
F9 secondhand leads correctly quarantined. F1-API/D1/D3 NOT VERIFIED (absent evidence — all
Timefold API-semantics lookups 404). D6 REFUTED as overreach (M3). D2/D4/D5 VERIFIED.
Retained evidence table: 5 files with sha256 (v1.6.0, v2.0.0, v2.2.0 providers; two
VolunteerHub HTML snapshots).

## 6. research/source-map.json (S1–S10)

S1 brief (sha cc962dde…e73cf, 21:12Z); S2/S3 VolunteerHub home + scheduling pages (21:17/
21:18Z, live pages, no sha — M7 exposure); S4 CiviVolunteer repo (master, pushed_at
2026-10-01, 1811 commits); S5 CiviVolunteer docs intro (recurring = Future plans only);
S6 CiviVolunteer 2.2 release notes (VOL-267/VOL-269); S7 Timefold stable provider (sha
c59fa688…26a4, commit ab36b9c36c17 2026-07-10, retained); S8 v1.10.0 provider (sha
3c9fc645…6fcb, commit 0edf2339ca75, retained); S9 v1.6.0 provider (fetched, NOT retained
by research — later retained by critic C3); S10 OR-Tools example page (no sha).
Secondhand notices: schedly.io, Rosterfy, Better Impact/Volgistics/SignUpGenius/Zelos/
Serve.love, Baeldung, app.timefold.ai catalog, docs.timefold.ai fairness page (first URL
404) — leads only, never evidence.

## 7. critic/source-map.json (C1–C17)

C1/C2 re-verification of retained stable + v1.10.0 files (byte-identical); C3 v1.6.0 now
retained (sha 0ea6b005…a33e, 111 lines, no balance constraint); C4 v2.0.0 restructured-path
provider (NEW evidence — balance present, sha = stable); C5 v2.2.0 same (sha = stable);
C6 old-path commit history (11 commits, author vs committer dates); C7 new-path history
(5 commits, first b2056965eb30 2024-06-19); C8 tags + contents probes (restructure
evidence); C9 releases/latest 404 (negative); C10 CiviVolunteer repo API metadata; C11/C12
VolunteerHub full-HTML snapshots (browser-UA, sha256 retained); C13 OR-Tools 9-point (not
retained); C14/C15 CiviVolunteer docs/release notes (not retained); C16 negative-result
Timefold API lookups (4× 404); C17 own-arm input ingestion with hash verification.

## Reviser takeaways for final.md (ticket 2+)

- Every M1–M9 and m1–m9 gets an explicit accept/amend/reject/retain-uncertainty verdict.
- Final must be self-contained (M9): restate mobile, check-in, import/dedupe, scale,
  accessibility-absence constraints in the final itself.
- Adopt corrected evidence record (M1/N1 window: v1.10.0 absent 2024-05-14 → present
  ≤2024-06-19 at b2056965eb30, byte-identical through 2.3.0; exact introducing diff remains
  unknown).
- Fix M2 sentence; narrow M3 immediacy; reclass M4 P6 tests; narrow M5 P4 ground; restate
  M6 OR-Tools mechanism; keep M8 semantics labeled unevidenced; name committer-date
  convention (m2); correct line counts (m1); strike P3 "none material" (m5); add m4 diff
  line; keep proposed/executed separation intact.
