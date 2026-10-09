# Final — S08 volunteer-shifts (A-M08-A, control arm, M08 reviser stage)

Complete planning deliverable for the food-bank volunteer scheduling brief. This is the
reviser-stage final: one coherent, self-contained document built from the research draft,
amended by an evidence-based adjudication of the independent critic's findings (all 9
material and 9 minor findings adjudicated in `adjudication.md`; the operative changes are
stated in place below). Sources are public primary documents mapped to immutable IDs
(research S1–S10, critic C1–C17); where a claim rests on evidence this arm could not
obtain, that is stated rather than guessed. All times are UTC.

**Honesty record.** Executed checks in this arm are source retrieval and verification
only: HTTP fetches with status checks, sha256 hashing of retained files, tag-by-tag file
comparison, GitHub API metadata queries, and phrase checks against retained page
snapshots. No scheduler, solver or product code was built or run — no runtime is
available in any stage of this arm. Everything marked **proposed** below has NOT been
executed. Nothing was run to produce the numbers quoted from sources.

---

## 0. Binding constraints carried into this plan (restated for self-containment)

From the brief (S1, sha256 `cc962dde…e73cf`):

1. **Scale: 180 volunteers.** Modest for a solver; the cited solver examples run at
   nurse-demo scale (5 nurses × 7 days × 3 shifts) and are illustrative, not capacity
   limits — but band/enumeration tricks sized for demos need re-derivation at 180.
2. **Changing availability.** Availability must be first-class data, updated as a single
   source of truth; the plan may not assume equal availability across volunteers (brief
   constraint), and must define what happens when availability changes mid-cycle.
3. **Recurring shifts** (the thin plan's P1) and coordinators' need for **predictable
   coverage** — the operational goal the fair-assignment machinery serves.
4. **Mobile access**, including an on-site **volunteer mobile app with check-in**
   (product precedent: VolunteerHub, S2–S3, verified against retained snapshots C11/C12).
5. **Accessible reminders.** Channel and timing evidence exists (S3); accessibility
   specifics beyond channel choice are NOT evidenced by any fetched source and none were
   invented (the brief forbids inventing requirements) — carried as absent evidence and
   a proposed validation (§O6).
6. **Privacy-limited sharing.** The only concrete mechanisms found are VolunteerHub
   "Advanced Permissions" (S2, snapshot-verified) and CiviVolunteer's relationship-based
   management plus two named permissions (S5–S6). Both argue for gated visibility.
7. **Occasional imported rosters.** Import surface evidence exists (VolunteerHub
   integrations incl. Salesforce/Blackbaud/Zapier, S2; CiviVolunteer inherits CiviCRM
   import tooling); no fetched source documents a roster-CSV identity/dedupe contract —
   absent evidence, recorded, with a discriminating test proposed (§O6).
8. **Do not invent legal requirements; do not assume equal availability.** Held
   throughout; both shape the P2 and P4 dispositions below.

## Revealed plan (verbatim, `revealed-plan.md`)

> P1: Generate recurring shifts from a weekly template. P2: Assign the first available
> volunteer alphabetically. P3: Allow coordinators to swap names. P4: Email everyone the
> full roster. P5: Use local wall-clock timestamps. P6: Test one ordinary week.

## Disposition summary (after adjudication)

| P | Clause (short) | Final disposition |
|---|----------------|-------------------|
| P1 | Weekly-template recurring shifts | **Already-covered pattern, retained with conditions**; corrections required on timezone/DST semantics and end-conditions |
| P2 | First-available volunteer alphabetically | **Rejected as the sole mechanism**; correction: deterministic alphabetical order survives only as a tiebreak inside a fairness-aware assignment policy; user decision on auto vs self-signup |
| P3 | Coordinator name swaps | **Already-covered pattern, conditional** (constraint re-validation + permissions + audit trail); optional volunteer-initiated swap requests |
| P4 | Email everyone the full roster | **Rejected as stated**; correction: targeted per-shift reminders + permission-gated roster visibility; user decisions on shift-mate visibility and channels |
| P5 | Local wall-clock timestamps | **Rejected as the storage model**; correction: UTC instants + explicit IANA timezone; wall-clock is presentation only |
| P6 | Test one ordinary week | **Already-covered as the smoke base**; DST-recurrence and fairness tests reclassified as **correction-validation (mandatory)**; import/permission/accessibility probes remain optional enhancements |

---

## O1 — Products and materially different approaches discovered beyond the thin plan

Four architecture families were examined with primary evidence; the first three are
retained as live design inputs, the fourth as the counterweight mechanism.

1. **Commercial scheduling marketplace (self-signup) — VolunteerHub.** Primary-page
   evidence (S2, S3; all quotes verified against the retained full-HTML snapshots C11/
   C12, hashed in `critic/source-map.json`): volunteers "browse events, register, and
   manage their own schedules"; "Capacity limits prevent over-booking"; "Fill
   cancellations with waitlists"; "Create recurring shifts in seconds"; "Duplicate
   schedules, reduce repetitive admin work"; the system "automatically sends
   confirmations, reminders, and follow-ups" with customizable timing and "email or
   optional text messages"; approval workflows and org-defined rules for volunteer
   self-cancellation; registration-triggered group placement ("Requires Orientation,"
   "Requires Background Check"); a volunteer mobile app with on-site check-in;
   "Advanced Permissions" as the closest named privacy control; availability stored in
   the volunteer database. **Useful and unfamiliar here:** waitlist-driven cancellation
   filling and registration-triggered group placement — both reduce coordinator load and
   neither was named in the thin plan.
2. **CRM-integrated open-source extension — CiviVolunteer** (for CiviCRM; AGPL-3.0 with
   exception file per the repo page; file-level license names not re-verified — GitHub
   API `license` field is null, C10, and this stays recorded as unverified at file
   level). Multiple volunteer projects; opportunities "with distinct roles and shifts";
   "Manually assign volunteers to shifts"; sign-up or interest-only registration; hours
   logging and reporting; relationship-based management ("Volunteer Manager" decides who
   manages) with permissions `Edit Volunteer Project Relationships` /
   `Edit Volunteer Registration Profiles` (S4–S6). Crucially, the latest docs list
   **recurring opportunities only under "Future plans"** (with skill-matching, org
   links, recognition, self-service hour logging) — recurrence is absent from the
   shipping product (S5, C14). Useful as the data-ownership-first alternative; its
   recurrence gap is itself a design input for P1.
3. **Constraint solver with an explicit fairness metric — Timefold (formerly
   OptaPlanner) quickstart `employee-scheduling`** (S7, retained and re-hashed this
   stage: sha256 `c59fa688…26a4`). Hard constraints: required skill; no overlapping
   shifts (penalized by minute overlap); at least 10 hours between two shifts (penalized
   by missing break minutes, `(10 * 60) - breakLength`); max one shift per day
   (`toLocalDate()` day bucketing); "Unavailable employee" (penalized by overlapping
   duration in minutes against `Employee::getUnavailableDates`). Soft constraints:
   undesired/desired dates (penalized/rewarded by overlapping minutes) and
   `balanceEmployeeShiftAssignments`, retained verbatim from the file (stable, lines
   114–122):

   ```java
   constraintFactory.forEach(Shift.class)
       .groupBy(Shift::getEmployee, ConstraintCollectors.count())
       .complement(Employee.class, e -> 0L) // Include all employees which are not assigned to any shift.
       .groupBy(ConstraintCollectors.loadBalance((employee, shiftCount) -> employee,
               (employee, shiftCount) -> shiftCount))
       .penalizeBigDecimal(HardSoftBigDecimalScore.ONE_SOFT, LoadBalance::unfairness)
       .asConstraint("Balance employee shift assignments");
   ```

   **Evidentiary status of the fairness semantics (adjudication M8, retained
   uncertainty):** the file shows the *calls* — including a comment stating the intent
   to include never-assigned employees — but their behavior is upstream-API semantics
   that no fetched source proves: `complement` zero-inclusion, `LoadBalance::unfairness`
   spread statistics, and the BigDecimal requirement of `penalizeBigDecimal` all had
   their primary-doc lookups fail (docs page and javadoc paths HTTP 404 in both stages;
   C16). The final carries them as **code-observed calls with unevidenced semantics**;
   the fairness recommendation in P2 is therefore an open design point, not a settled
   finding. The BigDecimal score type is in the file itself (`HardSoftBigDecimalScore`
   is what the code passes); the claim that BigDecimal is *required* by that API shape
   is the part left labeled unevidenced.
4. **Solver with quota bands — Google OR-Tools CP-SAT employee scheduling example**
   (S10, 9-point verified C13). Load distribution by explicit integer bands:
   `min_shifts_per_nurse = (num_shifts * num_days) // num_nurses`, max = min or min+1
   depending on divisibility, enforced as linear constraints; requests are a 3D binary
   array `shift_requests[n][d][s]`; the objective maximizes fulfilled requests (unitless
   counts); coverage is `add_exactly_one` per shift and `add_at_most_one` per nurse-day.
   **Mechanism stated precisely (adjudication M6):** bands are uniform across nurses and
   requests are soft preferences, so a nurse requesting nothing can still be assigned up
   to the band — **availability never binds this model**. With this brief's changing
   availability, uniform bands are the wrong shape: bands would have to be computed per
   volunteer over days they are actually available, or the mechanism replaced.

**Retained unverified leads** (search snippets only, never fetched, never cited as
evidence — kept per O5 as candidates for later primary verification): Schedly
(advertises automated reminders 24h before shifts), Rosterfy, Better Impact, Volgistics,
SignUpGenius, Zelos, Serve.love, the app.timefold.ai constraint catalog ("Balance shift
count", "Balance time worked"), and a Baeldung Timefold tutorial. The timefold.ai docs
fairness page 404'd on the first URL in the research stage and the 404 was reproduced in
the critic stage (C16); the docs-index alternative was not pursued (recorded as a
discoverable-alternative gap, adjudication m6 — no content is asserted from unfetched
pages).

## O2 — Governing defaults, units, types, limits, applicability

- **Timefold quickstart (S7; re-verified locally this stage).** Score model:
  `HardSoftBigDecimalScore` (in-file; the API-requirement nuance is labeled unevidenced
  per §O1). ONE_HARD per violating entity (or per minute where scaled), ONE_SOFT for
  preferences and fairness. Units: all temporal penalties are minutes (ints) derived via
  `.toMinutes()` from `Duration`. Fairness unit: `LoadBalance::unfairness` (semantics
  unevidenced — §O1). Default policy encoded in the file: 10h minimum rest, one shift
  per day, unavailability hard, desire/undesire soft. Limits: none declared in the file;
  solver runtime limits live outside it (absent evidence, stated — D5 verified).
  **Applicability:** hard constraints are the template for this plan's invariants
  (P2/P3); the file's naive `LocalDateTime`/`Duration` math is the anti-template for P5.
- **OR-Tools example (S10/C13).** Types: booleans for assignments, 3D binary for
  requests. Units: objective in fulfilled-request counts; bands in integer shifts.
  Defaults: the requests example runs with solver defaults (no `max_time_in_seconds`
  or `num_workers` set); the enumeration variant sets `linearization_level = 0` and
  `enumerate_all_solutions = True` and stops after 5 solutions via callback. Stated
  limits: none; the 5,184-solutions figure belongs to the smaller 4-nurse example with
  an "usually not practical" note — a scale caution, not a model limit.
  **Applicability caveat (M6-corrected):** uniform bands + soft requests mean
  availability never binds; not directly usable under this brief without per-volunteer
  re-derivation.
- **VolunteerHub (S2–S3, snapshot-verified C11/C12).** Governing product defaults:
  capacity per event, waitlists, recurring shift creation, reminder channel = email +
  optional text with organization-customizable timing, self-service
  registration/cancellation governed by org-defined rules, permissions via "Advanced
  Permissions". These are observable product capabilities; **no algorithmic semantics
  are published** (how waitlists rank, how recurrence expands, default reminder timing)
  — absent evidence, stated rather than guessed.
- **CiviVolunteer (S4–S6, C10, C14–C15).** Governance defaults: relationship-based
  management plus the two named permissions; 2.2 configurable project defaults "for a
  project's manager, beneficiary, and other relationships"; API invariant (2.2+):
  `VolunteerProject.create` auto-creates a flexible need and `VolunteerNeed.create`
  throws an exception on a second flexible need (VOL-269). Scale evidence for 180
  volunteers: none published — absent evidence, stated.

## O3 — Issue/fix/regression/release evolution chains

**Chain A — Timefold fairness constraint (verified by direct tag fetches and GitHub API
metadata; corrected window per adjudication M1/N1).** The provider file's history on the
original `use-cases/` path (11 commits, GitHub API): initial add `47ef6d071b00`
(committer date 2022-01-21), "Add 10 hours between shifts constraints" `d1f5e9c7d4de`
and "Use Duration instead of ChronoUnit" `2c581f3998b8` (both committer 2022-02-07),
"PLANNER-1709 Improved penalize/reward/impact overloads" `bbab27e92dda` (2022-09-07),
the fork-rename `0e274a686bbe` "Timefold fork step 5: rename packages" (2023-04-20),
then release bumps v1.6.0 (2024-01-10), v1.10.0 (2024-05-14), `b2056965eb30`
(2024-06-19), and "build: release version 2.3.0 (#1113)" `ab36b9c36c17` (2026-07-10).
**Dates are committer dates throughout — the convention is named here** (author dates
differ by up to 9 weeks on the initial commit; per-commit author/committer separation
verified in the critic stage, F5). Tag-by-tag content, with **corrected line counts**
(adjudication m1; `wc -l`, not a `cat -n`-style count): `balanceEmployeeShiftAssignments`
is **absent** at v1.6.0 (111 lines) and v1.10.0 (122 lines; uses `HardSoftScore`, has
`Availability`/`AvailabilityType` domain classes, `forEachUniquePair` in the 10-hours
constraint, and a full-shift-duration unavailable penalty), and **present** at stable
2.3.0 (124 lines) — all three files retained and re-hashed this stage. **Corrected
arrival window (supersedes the draft's implied "up to 2026-07"):** the repo restructured
between v1.10.0 and v2.0.0 — at v2.0.0–v2.2.0 the old path 404s because the path is
absent (quickstarts moved under `java/<project>`); at the restructured path the provider
exists at v2.0.0, v2.1.0 and v2.2.0 **byte-identical to stable** (equal sha256
`c59fa688…26a4`, re-hashed here, and re-confirmed by a fresh live fetch in this stage:
HTTP 200, 124 lines, 2 occurrences at v2.0.0; old path HTTP 404). The restructured
path's first commit is `b2056965eb30` (2024-06-19). **Conclusion:** the constraint
demonstrably exists from ≤ 2024-06-19 and is unchanged through 2.3.0 — a window of
roughly one month after v1.10.0, not two years. **RETAINED UNCERTAINTY:** the exact
introducing diff inside `b2056965eb30` is not decomposed — both path histories contain
only release/restructure commits in the relevant window and commit search found no
feature commit, so "arrived inside `b2056965eb30`" is the honest terminal statement.
An evolution detail the draft omitted, now added (adjudication m4): v1.10.0's
`atLeast10HoursBetweenTwoShifts` uses `forEachUniquePair` while stable uses
`forEach().join()` — a behaviorally near-equivalent pairing change worth recording.
The repo has no GitHub Release objects (`releases/latest` → 404), so "2.3.0" is a
tag/release-commit designation only (verified twice, C9).

**Chain B — CiviVolunteer 2.2 (S6, C15).** Bug/regression chain with IDs: VOL-267
"can result in accidental mass deletions of project data" (upgrade "strongly
recommended"); VOL-269 API behavior change turning a silent duplicate-flexible-need into
a thrown exception. Feature evolution: 2.1 volunteer project defaults → 2.2 defaults for
"manager, beneficiary, and other relationships", the two new permissions, and
custom-field report columns. Combined with S5/C14 ("Future plans" still lists recurring
opportunities), recurrence has been planned-but-unshipped across the 2.x line as of the
latest docs. **The release notes and docs index show no dates** (footer years only), so
recency of that status is bounded by the access date 2026-10-09 — stated, not smoothed
over. License files at file level: not re-verified (C10 license field null) — retained
uncertainty.

**Chain C — absent by design.** The OR-Tools page (S10) is a static example page without
version/issue references; no issue/fix chain was available there. Stated honestly per O3
rather than substituted with an unrelated chain.

## O4 — Comparison of every exact P clause (post-reveal, post-adjudication)

Each subsection quotes the clause exactly, gives the disposition, the retained findings
(material text, not ID references), required corrections, conditions, retained
alternatives, user decisions, and residual uncertainty.

### P1 — "Generate recurring shifts from a weekly template."

**Disposition: already-covered pattern, retained with conditions; corrections required
on timezone/DST semantics and end-conditions.**

- **Retained findings.** Weekly-template recurrence is the established product pattern:
  VolunteerHub — "Create recurring shifts in seconds" and "Duplicate schedules, reduce
  repetitive admin work" (S3, snapshot-verified C12). CiviVolunteer still lists
  recurring opportunities only under "Future plans" (S5/C14), and its 2.x release chain
  (VOL-267/VOL-269, §O3 chain B) shows recent work went to permissions and API
  invariants, not recurrence — evidence that recurrence is genuinely hard to ship, not a
  trivial feature. Both solver sources model concrete dated shifts, so recurrence is an
  expansion step upstream of assignment. The "already-covered" classification rests on
  the VolunteerHub precedent alone (CiviVolunteer's gap is real and stated).
- **Corrections (required if adopted).** (1) The template must pin an explicit IANA
  timezone, and expansion to concrete shift instances must be defined at DST boundaries
  (see P5). (2) The expansion design fork must be chosen and stated: materialize an
  N-week horizon of instances vs resolve recurrence on read. (3) The template must
  carry capacity and role so downstream assignment can enforce them. (4) Skip/holiday
  rules need an explicit decision.
- **Alternatives retained.** RFC 5545-style RRULE rules (expressive, standard, heavier)
  vs the thin weekly template (adequate for food-bank weekly patterns); materialized
  instances vs on-read expansion.
- **User decisions.** Expansion fork; holiday/skip semantics; how far ahead instances
  materialize.
- **Uncertainty.** No fetched source documents a recurrence expansion contract;
  VolunteerHub's behavior is unpublished. How coordinator edits to a single instance
  (occurrence-level override) interact with the series is unknown from evidence.

### P2 — "Assign the first available volunteer alphabetically."

**Disposition: rejected as the sole mechanism. Correction: deterministic alphabetical
order survives only as a tiebreak inside a fairness-aware assignment policy. User
decision: auto-assign vs self-signup.**

- **Retained findings.** Alphabetical-first-available is deterministic and predictable —
  which genuinely serves the coordinators' coverage need — but it is systematically
  biased: volunteers early in the alphabet approach permanent assignment; volunteers
  late in the alphabet approach zero shifts. This bias argument is reasoning from the
  brief's own fairness-relevant framing, not a source claim, and is labeled as such. The
  strongest implementation evidence for the standard alternative is Timefold's
  `balanceEmployeeShiftAssignments`, whose in-file comment states the intent to include
  never-assigned employees in the fairness statistic (§O1; semantics unevidenced per
  M8). The OR-Tools example is the counterweight mechanism, now stated precisely (M6):
  uniform bands and soft requests mean availability never binds — usable here only with
  per-volunteer band re-derivation.
- **Corrections required if any auto-assignment ships** (adjudication M3 applied):
  (1) Availability needs a single source of truth updated when availability changes,
  with assignment **re-solved on change** — the solver evidence (hard "Unavailable
  employee" constraint, S7) supports solve-time enforcement only; that the effect is
  *immediate* in wall-clock terms is a **design requirement of this plan**, not a
  source-backed fact. (2) Role/skill fit must gate eligibility (S7 `requiredSkill` hard
  constraint). (3) Assignment must re-check capacity and one-shift-per-day invariants
  (S7 overlapping-shift and one-shift-per-day constraints).
- **User decisions.** (a) Should assignment fill silently or propose-and-confirm? The
  patterns VolunteerHub documents emphasize the opposite of silent auto-assign — self
  sign-up plus approval workflows and waitlists (S3, snapshot-verified C12); stated as
  documented-pattern emphasis, not market-dominance claims (adjudication M5). (b) Is
  the fairness statistic availability-normalized (this plan's recommendation) or raw
  shift counts? Neither fetched source normalizes fairness by availability — this stays
  an open design point (retained uncertainty, §O5/§O6).
- **Alternatives retained.** Availability-normalized fair queue (round-robin over
  per-volunteer available capacity); seeded lottery (auditable randomness); self-signup
  + waitlist + coordinator approval; CP-SAT/Timefold optimization with fairness as a
  soft constraint and availability as hard. Timefold's `complement(..., e -> 0L)` is
  the only retained mechanism that includes zero-shift volunteers in the statistic by
  construction (code-observed; semantics label as above).
- **Uncertainty.** No evidence on how commercial products rank waitlists; fairness
  normalization is an open design point; Timefold API semantics unevidenced (M8).

### P3 — "Allow coordinators to swap names."

**Disposition: already-covered pattern; conditional (must re-validate constraints);
optional enhancement: volunteer-initiated swap requests with coordinator approval.**

- **Retained findings.** Manual reassignment is standard: VolunteerHub supports approval
  workflows and org-defined self-cancellation/modification rules (S3, snapshot-verified
  C12); CiviVolunteer's evidence shows relationship-based **management** ("Volunteer
  Manager" decides who manages) plus two named permissions — stated at that scope, not
  as "the whole permission model" (adjudication m3). Swapping names is uncontroversial
  as a capability.
- **Conditions.** (1) A swap must re-validate the same hard invariants as initial
  assignment: capacity per shift, role/skill eligibility, no double-booking, and the
  receiving volunteer's current availability (S7 hard constraints are the template).
  (2) The permission model must say who may swap whom — CiviVolunteer's
  relationship/permission granularity is the concrete precedent. (3) An audit trail of
  swaps is required so coordinators can see what changed and when — **a design
  requirement of this plan, not a source-backed fact** (adjudication m5).
- **Optional capability.** Volunteer-initiated swap/offer requests that fire only after
  coordinator approval — consistent with both products' approval-workflow evidence and
  with privacy limits (volunteers never mutate the roster directly).
- **Uncertainty.** The main open point is choosing permission granularity — a product
  decision, carried to §"Consolidated user decisions" (the draft's "none material"
  is struck, m5).

### P4 — "Email everyone the full roster."

**Disposition: rejected as stated. Correction: targeted per-shift confirmations/reminders
to assigned volunteers, full roster visibility gated by permissions. User decisions:
shift-mate visibility, reminder timing/channels, broadcast digest existence.**

- **Retained findings, ground narrowed per adjudication M5.** The clause collides with
  two brief constraints, and the rejection rests on exactly these two:
  (1) **Privacy-limited sharing** — broadcasting one full roster to all 180 volunteers
  is ungated visibility; the only fetched privacy mechanisms are VolunteerHub "Advanced
  Permissions" (S2, snapshot C11) and CiviVolunteer relationship-based management plus
  named permissions (S5–S6), both of which support *gated visibility*. (The earlier
  "publishes everyone's contact info" claim is withdrawn as not evidenced — a roster
  need not carry contact info.) (2) **Signal-to-noise** — the documented reminder
  practice is targeted: the system "automatically sends confirmations, reminders, and
  follow-ups" to the relevant volunteer, with customizable timing and "email or optional
  text messages" (S3, snapshot-verified C12); a full-roster blast to people not
  scheduled that week contradicts the product evidence.
- **Correction.** Reminders go to assigned volunteers per shift. Accessibility: plain-
  text alternative alongside HTML is proposed as good practice, but **no fetched source
  evidences reminder-accessibility specifics and no WCAG or other requirement is
  invented** — absence recorded, discriminating test proposed (§O6). Coordinators get
  full-roster views by permission role.
- **User decisions.** (a) May a volunteer see who else is on their shift (coordination
  value vs privacy)? (b) Default reminder timing and channels; opt-in for SMS (cost and
  consent implications). (c) Whether a broadcast "weekly summary" exists at all, and if
  so whether it is roster-wide or personal ("your upcoming shifts").
- **Alternatives retained.** Personal digests; shift-mate views limited to first name;
  coordinator-only roster export.

### P5 — "Use local wall-clock timestamps."

**Disposition: rejected as the storage model. Correction: store UTC instants plus an
explicit IANA timezone; render wall-clock in the UI; wall-clock survives only as
presentation.**

- **Retained findings (failure modes separated, per verification F3 / critic §P5).** The
  fetched code evidence shows naive local time is what solvers quietly assume: the
  Timefold provider computes overlaps, day bucketing (`toLocalDate()`, line 82) and rest
  breaks in `LocalDateTime` with plain `Duration` math, importing only
  `java.time.Duration` and `java.time.LocalDateTime` — no zone type anywhere (verified
  locally this stage). Two distinct drift modes result, now stated separately:
  **wrong-conversion drift** — an instant mis-stored in the wrong zone renders shifted
  wall-clock times; and **instant-reuse drift** — a wall-clock time stored once and
  reused as an instant silently changes meaning across a DST boundary. OR-Tools
  sidesteps timezones by indexing days and shifts as integers (S10). Neither addresses
  recurrence across DST. For a food bank the failure is concrete: a 9:00 shift from a
  weekly template renders 8:00 or 10:00 after a DST boundary, and reminder delivery —
  the accessible-reminders requirement — is computed off stored instants.
- **Correction.** Persist shift start/end as UTC instants; store one IANA zone per site
  (or per shift if multi-site); expand recurring templates in the zone, not in UTC;
  display wall-clock; fire reminders from instants. §O6's DST test discriminates this.
- **Uncertainty.** How VolunteerHub or CiviVolunteer handle time storage is undocumented
  in fetched sources — absent evidence, stated rather than guessed.

### P6 — "Test one ordinary week."

**Disposition: already-covered as the base smoke test; DST-recurrence and
fairness-discrimination tests are **correction-validation (mandatory)** — they validate
the P1/P5 and P2 corrections and belong with them under the O4 taxonomy (adjudication
M4); import, permission and reminder-accessibility probes remain optional enhancements.
Executed vs proposed strictly separated.**

- **Retained findings.** One ordinary week tests the happy path only. Each source family
  surfaces at least one risk class an ordinary week cannot catch: DST recurrence
  (P1/P5), availability change mid-cycle and fairness spread (P2), roster import edge
  cases (brief; no evidenced CSV contract), permission-gated sharing (P3/P4), reminder
  accessibility (brief; no evidenced specifics).
- **Validation set (all proposed — none executed; no runtime available in this arm).**
  1. **DST recurrence (correction-validation for P1+P5):** expand a weekly recurring
     series across a DST boundary; assert local wall-clock stability of every occurrence
     under the UTC+IANA storage model.
  2. **Fairness discrimination (correction-validation for P2):** toy instance where
     volunteer A is available 4× volunteer B; compare raw-count fairness vs
     availability-normalized fairness; also probes whether the Timefold-style statistic
     (as labeled, §O1) over-assigns the more-available volunteer.
  3. **Import round-trip (optional enhancement):** 180-row CSV with Unicode names and
     duplicate emails through the chosen import path; diff the volunteer table —
     discriminates the absent identity/dedupe contract (§0 item 7).
  4. **Permission probe (optional enhancement):** volunteer-role session attempts to
     read another volunteer's contact record — discriminates the P4 gated-visibility
     correction.
  5. **Reminder accessibility pass (optional enhancement):** screen-reader/text-alt pass
     over reminder templates — discriminates "channel exists" from "accessible" without
     inventing requirements.
  Each test discriminates a specific design choice above rather than asserting generic
  quality.
- **Executed in this arm (for honesty):** source retrieval and verification only —
  HTTP fetches with status checks, sha256 of retained files, tag-by-tag greps, GitHub
  API metadata calls (research + critic stages), and this stage's independent re-checks
  (re-hashing all 8 retained files, content greps, `wc -l`, phrase checks against
  snapshots, one live re-fetch of the v2.0.0 provider). No scheduler code was built or
  run; scope stays within this small product brief.

---

## O5 — Retained constraints, alternatives, disagreement, and uncertainty

**Original constraints carried forward** — see §0 (restated there so this document is
self-contained: 180-volunteer scale, changing availability, mobile access with on-site
check-in, accessible reminders with recorded evidence absence, privacy-limited sharing,
occasional imported rosters without an evidenced contract).

**Alternatives retained.** Fairness as (a) a spread metric over all volunteers
(Timefold-style `loadBalance` + `complement`; code-observed, semantics labeled
unevidenced), (b) min/max quota bands (OR-Tools; availability never binds as specified —
M6), (c) product-level process (waitlists, duplicate schedules, approval workflows —
VolunteerHub). Recurrence as RRULE vs weekly template; materialized vs on-read.
Filling as silent auto-assign vs propose-and-confirm vs self-signup+waitlist. Reminder
shape as targeted per-shift vs optional digest. Swap as coordinator-only vs
volunteer-initiated with approval.

**Disagreement/tension retained.** Quota bands are simple and auditable but break under
uneven availability; a spread metric handles uneven availability only if normalized by
availability — and **neither fetched source normalizes fairness by availability**, so
any implementation must add that. This is a genuine open design point, not a settled
finding, and validation (2) exists to discriminate it.

**Uncertainty register (consolidated; each item is retained, not resolved by assertion):**

- Timefold `complement` zero-inclusion, `LoadBalance::unfairness` spread semantics,
  BigDecimal API requirement: code-observed calls, unevidenced semantics — all primary
  lookups 404 in both stages (C16). Carried into §O1/P2 labels and validation (2).
- Exact introducing diff of the fairness constraint: not decomposable; bounded window
  (v1.10.0 absent 2024-05-14 → present ≤ 2024-06-19 in `b2056965eb30`), unchanged
  through 2.3.0 (M1).
- VolunteerHub algorithmic behavior (waitlist ranking, recurrence expansion, default
  reminder timing): unpublished.
- CiviVolunteer release notes/docs undated on the fetched pages; status bounded by
  access date 2026-10-09. License file names not verified at file level (m7).
- Reminder accessibility specifics: not evidenced by any fetched source; none invented.
- Fairness normalization by availability: unsupported by fetched sources — open design
  point.
- Live-page wording beyond the retained VolunteerHub snapshots (OR-Tools, CiviVolunteer
  pages): transcription-only, bounded by access date (m9). VolunteerHub serving is
  access-method-dependent (bot-UA 404 vs browser-UA 200, documented in C11/C12); quote
  verification is valid for the retained snapshots.
- Abandoned docs lead (timefold.ai index not tried after first 404): recorded as a
  discoverable-alternative gap (m6); no content asserted from unfetched pages.

## O6 — Discriminating validations and the executed/proposed separation

The validation set is in §P6: two correction-validation tests (DST recurrence;
fairness discrimination) and three optional enhancements (import round-trip; permission
probe; reminder accessibility pass). **Every validation above is proposed work; none has
run.** No runtime, solver or product sandbox exists in any stage of this arm; the only
executed checks are the source retrieval/verification operations itemized in the
honesty record at the top and in §P6. This separation is preserved everywhere: nothing
proposed is written in the past tense, and nothing executed is overstated beyond a
fetch/verify operation.

---

## Criticism adjudication outcome (what changed from the draft, and why)

Every critic finding was adjudicated with evidence rather than automatic obedience
(full record: `adjudication.md`). Net changes incorporated above: **M1** arrival window
corrected to ≤ 2024-06-19 (byte-identical v2.0.0–stable evidence; re-confirmed live this
stage) with the introducing-diff uncertainty retained; **M2** self-contradictory
"no non-release commit after 2022" sentence corrected to name the fork-rename commit;
**M3** "effective immediately" narrowed to "single source of truth + re-solve on change"
with immediacy as design requirement; **M4** DST/fairness tests reclassified as
correction-validation; **M5** P4 ground narrowed to gated-visibility + targeted-reminder
evidence (contact-publication claim withdrawn; "dominant pattern" reworded);
**M6** OR-Tools mechanism restated precisely (availability never binds); **M7** product
quotes now cite the hashed snapshots; **M8** Timefold API semantics labeled unevidenced;
**M9** binding constraints restated in §0; **m1** line counts corrected (111/122/124)
and convention named; **m2** committer-date convention named; **m3** permission-model
claim scoped to the evidence; **m4** pairing diff recorded; **m5** P3 zero-uncertainty
claim struck, audit trail labeled a design requirement; **m6** docs lead gap recorded;
**m7** license file-level verification retained as unverified; **m8** v1.6.0 evidence
cited to its retained copy; **m9** transcription-only risk retained. No critic finding
overturned a P classification class; all six consolidated user decisions and all
retained alternatives carry forward.

## Consolidated user decisions (product decisions to be taken by the owner)

1. Auto-assign vs self-signup+approval as the primary filling mode (P2).
2. Fairness metric: availability-normalized vs raw shift counts (P2; recommendation:
   normalized — an open design point, unsupported by fetched sources).
3. Recurrence: materialized horizon vs on-read expansion; holiday/skip rules (P1).
4. Shift-mate visibility for volunteers; broadcast digest existence and shape (P4).
5. Reminder default timing/channels; SMS opt-in (P4).
6. Swap-request self-service with approval; permission granularity for swaps (P3).
