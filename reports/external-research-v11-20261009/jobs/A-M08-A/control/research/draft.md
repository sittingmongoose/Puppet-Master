# Draft — S08 volunteer-shifts (A-M08-A, control arm, M08 stage research)

Complete planning deliverable for this scope, written after the reveal against the frozen discovery (`discovery.md`, sha256 `9d2798f9…19384`; `source-map.json` S1–S10). Discovery was not rewritten after reveal. Executed checks in this stage are only the source fetches/verifications recorded in `source-map.json` and discovery §O6; everything marked **proposed** below has NOT been run (no runtime available).

## Revealed plan (verbatim, `revealed-plan.md`)

> P1: Generate recurring shifts from a weekly template. P2: Assign the first available volunteer alphabetically. P3: Allow coordinators to swap names. P4: Email everyone the full roster. P5: Use local wall-clock timestamps. P6: Test one ordinary week.

## Disposition summary

| P | Clause | Disposition |
|---|--------|-------------|
| P1 | Weekly-template recurring shifts | already-covered pattern (product precedent) + conditional; needs timezone/DST and end-condition corrections |
| P2 | First-available-volunteer alphabetically | rejected as sole mechanism; correction: deterministic fallback inside a fairness-aware assignment policy; user decision on auto vs self-signup |
| P3 | Coordinator name swaps | already-covered pattern; optional enhancement: volunteer-initiated swap requests with approval; conditions on constraint re-validation and permissions |
| P4 | Email everyone the full roster | rejected as stated; correction: targeted reminders + permission-gated roster visibility; user decision on shift-mate visibility |
| P5 | Local wall-clock timestamps | rejected as storage model; correction: UTC instants + IANA timezone, wall-clock as presentation only |
| P6 | Test one ordinary week | already-covered as smoke test; optional enhancement: add discriminating scenarios (DST, fairness, import, permissions, reminder accessibility) |

---

## P1 — "Generate recurring shifts from a weekly template."

**Disposition: already-covered pattern, retained with conditions (correction of unspecified semantics).**

- **Retained findings.** Weekly-template recurrence is the established product pattern: VolunteerHub lets organizations "Create recurring shifts in seconds" and "Duplicate schedules, reduce repetitive admin work" (S3). CiviVolunteer still lists recurring opportunities under "Future plans" (S5), and its 2.x release chain (VOL-267/VOL-269, S6) shows its recent work went to permissions and API invariants, not recurrence — evidence that recurrence is genuinely hard to ship, not a trivial feature. Both solver sources (S7, S10) model concrete dated shifts, so recurrence is an expansion step upstream of assignment.
- **Conditions.** (1) The template must pin an explicit IANA timezone; expansion to concrete shift instances must be defined at DST boundaries (see P5). (2) Expansion horizon (e.g., N weeks materialized) vs virtual recurrence resolved on read is a real design fork — pick one and state it. (3) Template should carry capacity and role so downstream assignment can enforce them. (4) Skip/holiday rules need an explicit decision.
- **Alternatives.** RFC 5545-style RRULE rules (expressive, standard, heavier) vs the thin weekly template (adequate for food-bank weekly patterns); materialized instances vs on-read expansion.
- **Uncertainty.** No fetched source documents a recurrence expansion contract; VolunteerHub's behavior is unpublished. How it interacts with coordinator edits to a single instance (occurrence-level override) is unknown from evidence.

## P2 — "Assign the first available volunteer alphabetically."

**Disposition: rejected as the sole mechanism; correction retained — deterministic alphabetical order may survive only as a tiebreak inside a fairness-aware policy. User decision: auto-assign vs self-signup.**

- **Retained findings.** Alphabetical-first-available is deterministic and predictable (which serves the brief's coordinator-coverage need), but it is systematically biased: volunteers early in the alphabet get near-permanent assignment and volunteers late in the alphabet approach zero shifts. The strongest implementation evidence found says the standard mechanism is a fairness metric computed over **all** volunteers including zero-assignment ones — Timefold's `balanceEmployeeShiftAssignments` uses `complement(Employee.class, e -> 0L)` precisely so never-assigned volunteers count in `LoadBalance::unfairness` (S7); the OR-Tools example instead uses min/max quota bands, but its formula `(num_shifts * num_days) // num_nurses` implicitly assumes everyone is available every day (S10), which the brief forbids ("do not assume equal availability"). Neither fetched source normalizes fairness by availability — see discovery §O5 tension.
- **Corrections required if any auto-assignment ships.** (1) "Available" needs a single source of truth updated when availability changes, with the change effective immediately (hard "Unavailable employee" semantics in S7 are the template). (2) Role/skill fit must gate eligibility (S7 `requiredSkill` hard constraint). (3) Assignment must re-check capacity and one-shift-per-day invariants.
- **User decisions.** (a) Should assignment fill silently or propose-and-confirm? VolunteerHub's dominant pattern is the opposite of silent auto-assign: self sign-up plus approval workflows and waitlists (S3). (b) Is the fairness statistic availability-normalized (my recommendation) or raw shift counts?
- **Alternatives retained.** Availability-normalized fair queue (round-robin over per-volunteer available capacity); seeded lottery (auditable randomness); self-signup + waitlist + coordinator approval; CP-SAT/Timefold optimization with fairness as soft constraint and availability as hard.
- **Uncertainty.** No evidence found on how commercial products rank waitlists; fairness normalization is an open design point, not settled by sources.

## P3 — "Allow coordinators to swap names."

**Disposition: already-covered pattern; conditional (must re-validate constraints); optional enhancement: volunteer-initiated swap requests with coordinator approval.**

- **Retained findings.** Manual reassignment is standard: VolunteerHub supports approval workflows and org-defined self-cancellation/modification rules (S3); CiviVolunteer's whole permission model is relationship-based ("Volunteer Manager" decides who manages; `Edit Volunteer Project Relationships` / `Edit Volunteer Registration Profiles` permissions, S5–S6). Swapping names is therefore uncontroversial as a capability.
- **Conditions.** (1) A swap must re-validate the same hard invariants as initial assignment: capacity per shift, role/skill eligibility, no double-booking (S7's overlapping-shift and one-shift-per-day hard constraints), and the receiving volunteer's current availability. (2) Permission model must say who may swap whom — CiviVolunteer's relationship/permission granularity is the concrete precedent. (3) An audit trail of swaps is required for "predictable coverage" (coordinators must be able to see what changed and when).
- **Optional capability.** Volunteer-initiated swap/offer requests that fire only after coordinator approval — consistent with both products' approval workflow evidence and with privacy limits (volunteers never mutate the roster directly).
- **Uncertainty.** None material; the main gap is choosing permission granularity, which is a product decision.

## P4 — "Email everyone the full roster."

**Disposition: rejected as stated; correction: targeted per-shift confirmations/reminders to assigned volunteers, full roster visibility gated by permissions. User decisions: shift-mate visibility, reminder channels/timing.**

- **Retained findings.** The clause collides with two brief constraints. Privacy-limited sharing: emailing the entire roster to all 180 volunteers publishes everyone's contact info and schedule to everyone; the only fetched privacy mechanisms are VolunteerHub "Advanced Permissions" (S2) and CiviVolunteer's relationship-based permissions (S5–S6), both of which argue for gated visibility, not broadcast. Signal-to-noise: the established reminder practice is targeted — "automatically sends confirmations, reminders, and follow-ups" to the relevant volunteer, with customizable timing and "email or optional text messages" (S3); a full roster blast to people not scheduled that week contradicts the product evidence.
- **Correction.** Reminders go to assigned volunteers per shift (accessible formatting: plain-text alternative alongside HTML — accessibility specifics are NOT evidenced in any fetched source; recorded as absent evidence, and no WCAG claim is invented). Coordinators get full-roster views by permission role.
- **User decisions.** (a) May a volunteer see who else is on their shift (coordination value vs privacy)? (b) Default reminder timing and channels; opt-in for SMS (cost/consent implications). (c) Whether a broadcast "weekly summary" exists at all, and if so, whether it is roster-wide or personal ("your upcoming shifts").
- **Alternatives retained.** Personal digests; shift-mate views limited to first name; coordinator-only roster export.

## P5 — "Use local wall-clock timestamps."

**Disposition: rejected as the storage model; correction: store UTC instants plus an explicit IANA timezone, render wall-clock in the UI; wall-clock survives only as presentation.**

- **Retained findings.** The fetched code evidence shows naive local time is what solvers quietly assume — the Timefold quickstart computes overlaps and rest breaks in `LocalDateTime` with plain `Duration` math (S7), which silently shifts meaning at DST transitions; OR-Tools sidesteps timezones by indexing days and shifts as integers (S10). Neither addresses recurrence across DST. For a food bank the failure mode is concrete: a 9:00 shift generated from a weekly template becomes 8:00 or 10:00 wall-clock after a DST boundary if instants are mis-stored, and reminder delivery ("accessible reminders", mobile access) is computed off stored instants.
- **Correction.** Persist shift start/end as UTC instants; store one IANA zone per site (or per shift if multi-site); expand recurring templates in the zone, not in UTC; display wall-clock; fire reminders from instants. Discovery §O6 already proposes the discriminating test (recurring series across a DST boundary).
- **Uncertainty.** How VolunteerHub or CiviVolunteer handle this is undocumented in fetched sources (absent evidence, stated rather than guessed).

## P6 — "Test one ordinary week."

**Disposition: already-covered as the base smoke test; optional enhancement — extend with discriminating scenarios; separation of executed vs proposed preserved.**

- **Retained findings.** One ordinary week tests the happy path only. Every source family surfaces at least one risk class an ordinary week cannot catch: DST recurrence (P1/P5), availability change mid-cycle and fairness spread (P2, S7 `complement`), roster import edge cases (brief), permission-gated sharing (P3/P4), reminder accessibility (brief).
- **Enhancement (proposed, not executed — no runtime available).** (1) DST test: weekly recurring series expanded across a DST boundary; assert local wall-clock stability of every occurrence. (2) Fairness discrimination: toy instance where volunteer A is available 4× volunteer B; compare raw-count fairness vs availability-normalized fairness. (3) Import round-trip: 180-row CSV with Unicode names and duplicate emails; diff the volunteer table. (4) Permission probe: volunteer-role session attempts to read another volunteer's contact record. (5) Screen-reader pass over reminder email templates. Each test discriminates a specific design choice above rather than asserting generic quality.
- **Executed in this stage (for honesty):** only source retrieval and verification — HTTP fetches with status checks, sha256 of the brief and two retained code files, tag-by-tag greps of the Timefold constraint provider, GitHub API metadata calls — all recorded in `source-map.json`. No scheduler code was built or run; scope stays within this small product brief per O6.

## Optional capabilities and user decisions (consolidated)

1. Auto-assign vs self-signup+approval as the primary filling mode (P2).
2. Fairness metric: availability-normalized vs raw shift counts (P2; recommendation: normalized).
3. Recurrence: materialized horizon vs on-read expansion; holiday/skip rules (P1).
4. Shift-mate visibility for volunteers; broadcast digest existence (P4).
5. Reminder default timing/channels; SMS opt-in (P4).
6. Swap-request self-service with approval (P3).

## Uncertainty register

- Waitlist ranking, recurrence expansion, and reminder default timing at VolunteerHub are unpublished (S2–S3).
- The exact Timefold commit introducing the fairness constraint was not identified (discovery §O3 chain A); tags v2.0.0–v2.2.0 unverified at this path.
- CiviVolunteer release notes and docs index are undated on the fetched pages; "recurring = Future plans" status is bounded only by access date 2026-10-09 (S5–S6).
- Accessibility requirements for reminders were not evidenced by any fetched source and none were invented (brief constraint honored).
- Fairness normalization by availability is unsupported by fetched sources — open design point, carried into P2 and validation (1)–(2).
