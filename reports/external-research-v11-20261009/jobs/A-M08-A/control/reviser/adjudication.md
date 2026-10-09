# Criticism adjudication — A-M08-A control reviser (ticket 2)

Reviser verdicts on every criticism in `critic/critique.md` (M1–M9 material, m1–m9 minor),
the critic's P-disposition re-adjudication, and its rejected-demand list. Verdicts are
accept / amend / reject / retain-uncertainty, each with cited evidence from the draft,
critique, verification record, or the retained/live sources — not automatic obedience.

## Independence record (checks run in this stage, 2026-10-09 ~21:47–21:55Z)

- Re-hashed all retained files in `research/sources/` and `critic/sources/`. All five
  sha256 claims in `verification.md` and both source maps match exactly: stable =
  v2.0.0 = v2.2.0 = `c59fa688…26a4`; v1.10.0 = `3c9fc645…6fcb`; v1.6.0 = `0ea6b005…a33e`;
  VolunteerHub snapshots `b6c0710e…` / `8977c47d…`.
- Local greps: `balanceEmployeeShiftAssignments` absent in v1.6.0 and v1.10.0, 2
  occurrences each in v2.0.0/v2.2.0/stable; stable lines 114–122 show
  `complement(Employee.class, e -> 0L)` + `loadBalance` + `penalizeBigDecimal(...,
  LoadBalance::unfairness)` verbatim; stable imports only `java.time.Duration` and
  `java.time.LocalDateTime` (no zone type); v1.10.0 line 63 uses `forEachUniquePair` and
  imports `HardSoftScore` + `Availability`/`AvailabilityType` (lines 6, 12–13).
- `wc -l` on retained files: 111 / 122 / 124 (v1.6.0 / v1.10.0 / stable).
- Live re-fetch (browser-less curl): v2.0.0 restructured path HTTP 200, 124 lines, 2
  balance occurrences, sha `c59fa688…26a4` byte-identical to stable; old `use-cases/`
  path at v2.0.0 HTTP 404.
- Phrase spot-checks against retained VolunteerHub snapshots: "recurring shifts in
  seconds", "Duplicate schedules", "Fill cancellations with waitlists", "confirmations,
  reminders", "Capacity limits prevent", "approval workflows", "Advanced Permissions",
  "waitlist" — all present in the saved HTML.

## Material findings

**M1 — fairness-constraint arrival window (accept, with retained uncertainty).**
ACCEPT. Independently confirmed: the retained v2.0.0 and v2.2.0 providers are
byte-identical to stable (equal sha256, re-hashed here), the old path 404s at v2.0.0
while the restructured path serves the constraint, and a fresh live fetch today
reproduces this (HTTP 200 / 124 lines / 2 occurrences at the `java/` path; 404 at
`use-cases/`). Evidence: verification.md N1; C4/C5/C7/C8; draft §O3 chain A. The final
will state the corrected window — absent at v1.10.0 (2024-05-14), present by the
path's first commit `b2056965eb30` (2024-06-19) — replacing the draft's implied
"up to 2026-07". RETAIN UNCERTAINTY: the exact introducing diff inside
`b2056965eb30` remains undecomposed; no dedicated feature commit exists on either
path (critique "Invalid demands" #1 concurred). The bounded statement is the honest
terminal record.

**M2 — "no non-release commit after 2022" self-contradiction (accept).**
ACCEPT. The draft's own chain-A commit list includes `0e274a686bbe` (2023-04-20,
"Timefold fork step 5: rename packages"), which falsifies the sentence two clauses
later (draft §O3 chain A; verification F5). The substance survives — the rename is
not the fairness addition, and after v1.10.0 only release/restructure commits touch
the old path. The final corrects the sentence to name the fork-rename commit as the
sole non-release exception on the old path.

**M3 — P2 "effective immediately" overreach (accept).**
ACCEPT. The retained stable file is a constraint provider: constraints are evaluated
when the solver scores a solution; nothing in it establishes when or whether a
product re-solves on availability change (verification D6 REFUTED; F1/F2 show the
constraint list only). Amend P2 correction (1) to "single source of truth for
availability, re-solve on change"; immediacy of effect is restated as a design
requirement of this plan, not a source-backed fact.

**M4 — DST and fairness tests are correction-validation, not optional (accept).**
ACCEPT. The draft's own P1/P5 corrections (IANA-pinned expansion, UTC-instant
storage) and P2 fairness mechanism make the DST-recurrence and
fairness-discrimination tests validations of required corrections; leaving them
under "optional enhancement" contradicted the draft's disposition table (draft P6 vs
P1/P5 sections; critique M4). P6 in the final reclasses both tests as
correction-validation; the import, permission and accessibility probes remain
optional enhancements.

**M5 — P4 rejection ground broader than evidence (accept, disposition unchanged).**
ACCEPT the narrowing, REJECT the (already-rejected) demand to reverse the P4
disposition. A roster need not carry contact info, so "publishes everyone's contact
info" was not evidenced; what the fetched sources do support is gated visibility
(VolunteerHub "Advanced Permissions" — verified in snapshot C11; CiviVolunteer
relationship-based management, S5–S6) and targeted reminders ("automatically sends
confirmations, reminders" to the relevant volunteer — verified in snapshot C12).
The rejection still stands on the brief's privacy-limited-sharing constraint plus
signal-to-noise. Amend: the final's P4 ground cites exactly those two; "dominant
pattern is the opposite of silent auto-assign" becomes "the patterns VolunteerHub
documents emphasize self sign-up, waitlists and approval workflows" (marketing
emphasis, not market dominance — verification F7 'not verifiable').

**M6 — OR-Tools availability mechanism mislabeled (accept).**
ACCEPT. The precise mechanism per the fetched example (S10/C13, 9-point verified):
coverage constraints require exactly one nurse per shift and at most one shift per
nurse-day; load bands are uniform across nurses; requests enter only the soft
objective — so a nurse requesting nothing can still be assigned up to the band and
availability never binds the model. The draft's "implicitly assumes everyone is
available every day" was directionally right but the wrong mechanism (verification
F6 precision finding). The final uses the precise statement and keeps the
applicability caveat: with changing availability, per-volunteer bands or a
different mechanism is required.

**M7 — research-stage live-page evidence unretained (accept as record correction).**
ACCEPT. The research map shows no sha256 and no retention for S2–S6/S10, and the
critic observed concrete drift exposure (bot-UA 404 vs browser-UA 200 on both
VolunteerHub pages ~18 minutes after the research fetches — C11/C12 operations).
Independently re-verified in this stage: every product phrase the draft quotes is
present in the retained snapshots. The final cites the C11/C12 snapshots (with
hashes) as the verification basis for VolunteerHub quotes and records the
access-method-dependent serving as a documented drift risk. No quote content
changes.

**M8 — fairness claim rests on unverified API semantics (accept; retain
uncertainty).**
ACCEPT and RETAIN UNCERTAINTY. The stable file shows the calls, not their behavior;
all primary-API lookups failed in both stages (research S-secondhand notice;
critic C16: docs fairness page, two javadoc URLs, two source-path guesses all 404 —
verification F1-API). My stage adds no successful lookup, so no new evidence
exists. The final keeps `complement` zero-inclusion, `LoadBalance::unfairness`
spread semantics, and the BigDecimal requirement each explicitly labeled
"upstream-API behavior, not evidenced in this arm's sources"; the fairness
recommendation stays an open design point. Inventing semantics would violate the
brief; dropping the code-observed calls would understate real retained evidence —
labeling is the only sound amendment. The abandoned timefold.ai docs lead (m6) is
recorded as a discoverable-alternative gap without asserting catalog content; no
re-broadened discovery is warranted: C16 reproduced the 404s at 21:36–21:38Z, so
additional attempts inside this arm's window were unlikely to convert absence into
evidence, and the criticism does not block any P disposition.

**M9 — draft self-containment gap (accept).**
ACCEPT. O5 requires one self-contained coherent final, and the brief names mobile
access, accessible reminders, privacy-limited sharing and imported rosters as
binding constraints that only the frozen discovery discussed (discovery §O5; draft
consolidated sections omit them). The final adds a "binding constraints carried
into this plan" section restating: 180-volunteer scale note; changing availability
as first-class data; mobile access; on-site check-in (evidenced S2/S3); roster
import identity/dedupe as an open contract (no fetched source documents a CSV
contract — absent evidence); reminder accessibility beyond channel choice
unevidenced.

## Minor findings

- **m1 (line counts) — ACCEPT.** `wc -l` here: 111 / 122 / 124, exactly the
  critic's figures; the draft's 112/123/125 used a `cat -n`-style final-line
  convention. The final states `wc -l` counts and names the convention. Evidence:
  verification "Line-count claims"; local re-run.
- **m2 (committer-date convention) — ACCEPT.** Author vs committer dates differ by
  up to 9 weeks on the initial commit (2021-11-15 vs 2022-01-21; verification F5).
  The final names "committer dates" as the convention used in the evolution chain.
- **m3 ("whole permission model relationship-based") — ACCEPT.** S5–S6 evidence
  shows relationship-based *management* plus two named permissions
  (`Edit Volunteer Project Relationships`, `Edit Volunteer Registration Profiles`),
  not the whole model. Wording narrowed in P3.
- **m4 (unremarked pairing diff) — ACCEPT.** Confirmed locally: v1.10.0 line 63
  `forEachUniquePair` vs stable `forEach().join()` in the 10-hours constraint.
  One line added to the evolution chain.
- **m5 (P3 "none material" uncertainty) — ACCEPT.** The audit-trail condition is a
  design requirement with no fetched source (draft P3 condition 3); a zero-
  uncertainty claim was inconsistent. P3 in the final strikes "none material",
  labels the audit trail as requirement, and carries permission granularity as the
  open product decision.
- **m6 (abandoned docs lead) — ACCEPT; retain uncertainty.** Recorded as a
  discoverable-alternative gap, folded into M8's labeling above; no content is
  asserted from unfetched pages.
- **m7 (AGPL license files) — ACCEPT; retain uncertainty.** GitHub API `license`
  field is null (C10) and file names were not re-verified at file level. The final
  scopes the license claim to the repo page statement and marks file-level names
  unverified.
- **m8 (S9 unretained by research) — ACCEPT; superseded.** The critic retained
  v1.6.0 as C3; re-hashed here (`0ea6b005…a33e`, 111 lines, 0 balance
  occurrences). The final cites C3 for the v1.6.0 state.
- **m9 (transcription-only wording) — ACCEPT; retain uncertainty.** C13–C15
  fetches were not retained, so exact wording of OR-Tools/CiviVolunteer pages is
  transcription-only, bounded by access date. The final keeps this risk note and
  prefers short, stable quoted fragments.

## P-disposition re-adjudication table (critic §"P-disposition re-adjudication")

ACCEPT all six critic verdicts, on the evidence above: P1 keep class (recurrence
precedent rests on VolunteerHub alone; CiviVolunteer's own docs put recurrence in
Future plans — S5/C14); P2 keep rejection + narrow immediacy (M3) + fairness
normalization stays an open point (M8); P3 keep + strike "none material" (m5) +
narrow m3; P4 keep rejection + narrow ground (M5); P5 keep + split failure-mode
narrative into wrong-conversion vs instant-reuse drift (F3: naive
`LocalDateTime`/`Duration` verified, `toLocalDate()` day bucketing at line 82);
P6 reclass DST + fairness tests as correction-validation (M4), executed/proposed
separation intact (both predecessor stages ran fetch/verify only — confirmed by
their honesty records).

## Invalid critic demands (concurrence record)

The critic rejected five demands; the reviser concurs with each and none is treated
as an open criticism: (1) exact introducing commit — not derivable from public
evidence, bounded statement is correct (M1); (2) running the validations — no
runtime exists in any stage of this arm; proposals stay proposals (O6); (3) P4
reversal — narrowing, not reversal, is what the evidence supports (M5); (4) WCAG
requirements — the brief forbids inventing legal/requirements claims; absence is
recorded instead; (5) critic-side rewriting — outside the critic recipe; revision
is this stage's job.

## Net effect on final.md (ticket 3)

Incorporate: corrected M1 window + retained introducing-diff uncertainty; M2
sentence fix; M3 immediacy narrowing; M4 P6 reclass; M5 ground narrowing; M6
mechanism restatement; M7 snapshot-based citation + drift note; M8 explicit
unevidenced labels; M9 binding-constraints section; m1 counts + m2 convention; m3
narrowing; m4 diff line; m5 P3 uncertainty; m6/m7/m9 risk notes; m8 C3 citation.
All six user decisions and all retained alternatives/uncertainties from the draft
carry forward; no criticism found the draft's P classification classes wrong.
