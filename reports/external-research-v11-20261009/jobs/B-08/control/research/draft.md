# ER11 B-08 control / research — draft (investigator-complete planning deliverable)

Case I08 (school-district band instrument lending + repair). Method M15 v1, control arm, research stage.
Brief investigated alone; discovery.md + source-map.json + sources/ frozen BEFORE plan reveal via
`control/reveal-plan.py` (revealed 2026-10-09T21:04Z, P1–P6). Discovery was not rewritten after reveal.
This draft is a complete, self-contained planning deliverable for this scope; later M15 critic/reviser stages may correct it.
Source IDs (S01–S12) are evidence keys only — every material claim is stated in full prose below, not replaced by IDs.

Disposition vocabulary per P clause: already-covered (discovery agrees, plan direction stands),
correction (plan direction needs a substantive fix to satisfy the brief), optional enhancement
(useful but not required for pilot), user decision (district must choose; plan correctly defers or must defer),
rejected (considered and set aside with reason), uncertain (cannot be settled from current primary evidence).

## Per-P disposition

### P1: "Track instrument assignment, reported issue, repair state, expected return, and availability for loan."

Disposition: already-covered in direction; correction on how repair state and availability are represented;
optional enhancement on acceptance evidence.

- Retained: the pilot record carries an instrument identifier (asset tag + manufacturer serial), current school,
  loan status, append-only repair notes, expected return date, and availability for loan. Repair history is an
  append-only event log (timestamp, actor role, from→to status, note, optional photo); nothing is overwritten.
- Correction 1 — repair state must be explicit countable statuses, not adjectives in notes. The brief's binder pain
  (waiting-for-parts vs ready-for-pickup indistinguishable) recurs unless the two are distinct filterable states with
  shelf-matching counts. Two verified patterns: InvenTree custom states keep a logical availability key (e.g. OK) while
  showing a distinct label (e.g. Awaiting Parts, Ready for Pickup), so availability math stays correct while staff see
  different, countable states; Snipe-IT status meta (deployed / pending / ready-to-deploy / archived, with pending
  explicitly covering out-for-repair) plus checkout history gives the same separation on the checkout side. Either way,
  waiting-parts shows parts-needed + ordered date and ready-pickup shows pickup location + hold-until date.
- Correction 2 — availability is derived from status, not stored as free text. InvenTree's Available yes/no per status
  (OK/Attention/Damaged available; Destroyed/Lost/Rejected not) is the reference behavior: the loanable set is a query
  over status, so a repair transition automatically removes the instrument from availability.
- Correction 3 — expected return is an indexed date (nullable), not text. The overdue list (expected_return_date < today
  and status not available) with school + days-overdue is a first-class query; the teacher view shows a delay flag while
  the caregiver contact link stays staff-only.
- Correction 4 — urgent classroom capture must complete in under ~60 seconds on a classroom device, including recovery
  from an expired login without losing the draft (PocketBase auth is stateless tokens with no server session and no
  logout endpoint — logout is client token discard — so token expiry handling is a designed flow, not an error page).
- Optional enhancement — acceptance evidence via test templates: a trackable/testable instrument model defines named
  tests (e.g. play_test, pad_seating) with required / requires-value / requires-attachment flags; each stock result is
  boolean pass/fail + value/notes/attachment, multiple results allowed with most-recent-wins and full history kept;
  templates are disabled, never deleted, to preserve history. Test names generate API keys (lowercase alnum, leading
  underscore when digit-first, used by reports), so names freeze before pilot. This proves ready-pickup (passing
  play-test + photo) rather than asserting it.
- Uncertain — checkout-centric core (Snipe-IT) vs stock-state-centric core (InvenTree) vs lean custom core on a
  single-binary backend (PocketBase). All three can carry P1 if the corrections above hold. The choice follows hosting
  capacity (PHP/MySQL vs Python/Postgres vs one SQLite binary) and who maintains it in summer, not domain purity.

### P2: "Limit student and caregiver details to staff who need them for a loan or repair handoff."

Disposition: already-covered in direction; correction that the limit must be structural, not policy;
user decision on the district's directory-information designation and caregiver-contact basis.

- Retained: the schedule seen by many teachers shows at most instrument + school + loan/repair state + dates, plus at
  most what the district has designated as directory information for families that have not opted out. Grades and
  disciplinary data are out of the schema entirely — not hidden fields, absent columns.
- Correction 1 — separation by construction. Student identity behind the schedule is an opaque token with a staff-only
  join; caregiver contact lives in a separate restricted collection (channel, address, language preference,
  consent/notice basis, opt-out) that the teacher schedule view cannot reach. Concretely: a read-only view/projection
  (PocketBase view collections are read-only SQL SELECT with no realtime events — ideal for a teacher-safe schedule)
  omits contact + non-directory student data by projection, and API rules deny direct reads (PocketBase superusers bypass
  all API rules, so daily staff must never use superuser accounts). A policy that says "teachers shouldn't look" does not
  satisfy P2; a 403/absent on every teacher path (page, API, export, search) does.
- Correction 2 — caregiver contact is not student directory information and needs its own basis. U.S. Dept. of Education
  PTAC guidance: directory information (34 CFR 99.3 — information not generally considered harmful or an invasion of
  privacy if disclosed) may be disclosed without prior consent only under 34 CFR 99.31(a)(11)/99.37 after public notice
  of the designation, the right to restrict, and the opt-out window; timely opt-outs must be honored. The pilot stores a
  retention rule per collection (loan history vs contact) even if enforcement starts manual, and follows secure-deletion
  practice for retired records/devices.
- User decision — the district's actual directory-information designation + current opt-out list, and the caregiver-contact
  consent/notice basis + retention, must be supplied. Until provided, the pilot defaults to tokenized/minimal display.
  The bilingual liaison workflow should include the opt-out explanation in both languages.
- Uncertain — field-level visibility granularity inside Snipe-IT roles was not verified in fetched primary docs; if
  Snipe-IT is chosen, the teacher-cannot-see-contact check must pass before pilot (see validations), or contact stays in
  a companion restricted store.

### P3: "Provide large-print friendly screens and caregiver messages that can be prepared in two languages."

Disposition: already-covered in direction; correction on what each half means; optional enhancement on staff-UI localization.

- Correction 1 — large-print is not a theme, it is survival of standard scaling. WCAG 2.2 SC 1.4.4 Resize Text (AA):
  text including labels and controls must resize to 200% without assistive technology and without loss of content or
  functionality; the author's duty is to not block user-agent scaling (relative units, no fixed heights/clipping), and at
  least one agent scaling mechanism must work. WCAG 2.2 SC 1.4.10 Reflow (AA): no loss and no two-dimensional scrolling
  at 320 CSS px width (vertical scroll) / 256 CSS px height, where 320 px equals a 1280 px viewport at 400% zoom —
  except only for parts requiring 2D layout for usage or meaning (images, video, games, presentations, data tables but
  not individual cells, toolbars that must stay visible); cells inside tables must still reflow. Concretely: fluid
  layout with Flexbox/Grid reflow, relative type, wrapping cells; the loan table itself may scroll in two dimensions as
  one unit on a narrow layout, but filters, actions, and detail panes must not trap the user.
- Correction 2 — bilingual caregiver messages are a liaison-owned, versioned template catalog in two languages
  (delay_notice, ready_pickup, parts_waiting + opt-out explanation), with per-contact language preference. Free-text
  repair notes are never machine-translated into caregiver notices; translation quality here is procedure-gated
  (liaison review), not release-gated. No translation-vendor fix chain is claimed because none was selected.
- Optional enhancement — staff-UI localization via the platform (Snipe-IT ships 55+ languages with per-user language).
  This helps staff but does not translate caregiver messages; the template catalog is still required.
- User decision — which second language; liaison review workflow and template-approval ownership; whether staff UI also
  localizes or only caregiver messages.

### P4: "Support a small pilot that starts with one inventory room and selected schools."

Disposition: already-covered; correction that expansion is gated on checks, not anecdote.

- Retained: start with one inventory room + 2–3 schools, two music staff + part-time repair coordinator + a few
  classroom teachers + the family liaison. Instrument labels (printed asset tags) and shelf/bin locations are part of
  the pilot, not later polish.
- Correction — expand to nine schools only when all of these pass: (a) a teacher records an urgent issue during class
  without training in under ~60 seconds; (b) waiting-parts vs ready-pickup filtered counts match a physical shelf audit;
  (c) the teacher view provably excludes caregiver contact and non-directory student data on every path; (d) the repair
  coordinator alone performs backup + restore to a fresh host from the printed sheet and then completes a
  checkout→issue→ready-pickup cycle; (e) 200% text resize + 320-px reflow / 400% zoom pass on schedule, issue form, and
  repair board; (f) bilingual delay + ready templates are sent in both languages and understood. Each gate fails a real
  alternative (heavyweight forms, free-text status, single-table privacy, help-desk-dependent ops, fixed-pixel layouts,
  machine-translation shortcuts).
- Rejected as gate criteria: anecdotal "staff like it", raw login counts, or ticket volume — none proves handoffs are clear.

### P5: "Replacement approval and direct caregiver reporting are district program decisions."

Disposition: user decision — the plan correctly defers both; discovery retains the option space so the decision is informed.

- Replacement approval options: role (music staff vs repair coordinator vs principal/designee) × threshold (value,
  condition, loan history triggers) × record (approval event in the repair log with approver + reason). The system must
  represent approval as an explicit event regardless of who approves; it must not silently let any authenticated user
  mark an instrument replaced/retired.
- Direct caregiver reporting options: (a) no direct intake — caregivers call/email, staff transcribe (simplest, keeps
  triage quality); (b) structured request form (limited fields, no account) creating an un-triaged request staff accept
  or decline; (c) authenticated caregiver portal requests. Each option needs a stated acknowledgment SLA; (b) and (c)
  need spam/abuse handling and must not expose other students' loans. Discovery favors starting with (a), adding (b)
  only if triage stays clear — but this is the district's call, and the pilot works under any option.
- No correction: P5 as written is the right shape. The planning risk would be assuming an answer; nothing in this draft assumes one.

### P6: "The sign-in approach and any district system integration are not yet funded."

Disposition: already-covered; correction that the pilot ships local auth now with a documented migration, and must not
block on SSO.

- Retained: no district sign-in integration in the pilot. Ship local accounts with strong passwords (+ MFA where the
  platform supports it), least-privilege roles (teacher / staff / coordinator / liaison / admin), and no shared
  superuser for daily work.
- Correction — the migration is documented, not improvised later. Snipe-IT's observed path (SAML SSO login, LDAP/AD
  sync, Google Secure LDAP, SCIM provisioning) is the reference for a funded follow-up. If the core is PocketBase,
  district SSO via OIDC is unproven in the primary docs fetched for this stage — marked uncertain, not promised — so a
  PocketBase pilot documents "local auth now; SSO approach to be validated before any integration commitment."
- Summer condition (from the brief, preserved): no district help-desk ticket in the critical path June–August.
  Single host + file/one-click backups + printed restore sheet + printed picklists; no auto-updates during summer;
  version pins (observed PocketBase v0.40.5; Snipe-IT requires PHP 8.2+, 8.4+ recommended) with one maintenance window
  per term. PocketBase explicitly warns full backward compatibility is not guaranteed before v1.0 and upgrades expect
  changelog reading + manual migrations — so every upgrade is snapshot → migrate → restore-test, never auto-update
  during term or summer.
- $8k condition (preserved): existing district VM preferred; otherwise a small VPS + domain + backups (hundreds/year) +
  labels/printer + contingency. No per-seat SaaS in the pilot.
- Rejected: blocking the pilot on a funded SSO decision; sharing one admin login across staff; auto-updating the backend
  during the school year.

## Retained synthesis (self-contained)

Minimal pilot record: instrument (`instrument_id` unique printed tag + `serial` nullable + `model_ref` + `home_room` +
`current_school`); loan (`loan_status` enum: available, checked_out, issue_reported, in_triage, waiting_parts,
in_repair, ready_pickup, retired; plus `expected_return_date` date-nullable, `school`, opaque `student_ref`); repair as
append-only `repair_events`; caregiver contact in a separate restricted collection with language preference and
consent/opt-out; message templates versioned in two languages, liaison-owned. Repair state machine: checked_out →
issue_reported (teacher, <60 s) → in_triage (staff/coordinator) → waiting_parts | in_repair → ready_pickup →
checked_in/checked_out, every transition an attributable event. Waiting-parts vs ready-pickup are statuses with
counts/filters, never phrases in notes.

Materially different approaches kept: checkout-centric (Snipe-IT: lend/return + history + notifications as first-class
transitions) vs stock-state-centric (InvenTree: explicit status + Available math + test-template acceptance evidence) vs
ticket-centric triage layered on either; self-hosted open-source vs lean PocketBase core vs per-seat SaaS (SaaS rejected
for pilot on cost + data-review grounds); summer posture of single-host-plus-paper-fallback vs local-first PWA with
queued sync (PWA deferred: sync conflicts for loan state are worse than a short outage with paper fallback); bilingual
via platform UI localization (staff) + curated template catalog (caregivers); privacy via tokenized reference +
directory-information-only schedule + restricted contact collection.

Issue/fix/release chains (primary evidence, honestly bounded): Snipe-IT v8.8.0 checkout/checkin webhook notification
payload fix (FD-57297 / PR #19655, with added tests) plus better handling of incomplete checkouts for non-users, against
the PHP floor evolution (8.2+ required, 8.4+ recommended) — checkout/notify is the highest-churn path, upgrades are
coupled to runtime upgrades, notification content needs contract tests; PocketBase pre-1.0 breaking-change evolution
(v0.40.5 no-backward-compat warning, v0.23.0 breaking warning and v0.40.0 slight command-chaining break in changelog
context) — pin, snapshot, restore-test, never auto-update; InvenTree status→custom-states evolution — local labels
without breaking availability math, the direct precedent for the binder fix. Absent by honest statement: no
I08-specific bug claimed for any product; no translation-vendor or sync-framework chain (none selected).

## Validations: executed vs proposed

Executed in this research stage: primary-doc fetches and behavior extraction only (S01–S12 per source-map.json, excerpts
in sources/evidence.md, index in sources/index.md). No application runtime, no sandbox witness, no checkout/repair flow
executed. No usage/billing observed (null). No runtime-available claims.

Proposed discriminating validations for build/pilot (each fails a real alternative): (1) privacy projection — teacher
role queries schedule + attempts direct caregiver-contact read; pass = 403/absent on page, API, export, and search;
(2) repair-state audit — 20 seeded instruments across waiting-parts/in-repair/ready-pickup; shelf counts equal filtered
counts; notes phrasing cannot affect counts; (3) overdue query — expected_return_date < today and status not available
lists school + days-overdue + staff-only contact link, teacher view shows delay flag without contact; (4) urgent-issue
capture — teacher completes in <60 s including re-login after expired token with no lost draft; (5) accessibility —
200% text resize + 320-px reflow / 400% zoom on schedule, issue form, repair board; no clipped submit, no 2D trap outside
the table unit; (6) bilingual — liaison sends delay + ready templates in both languages to test contacts; preference
honored; free text never auto-sent as translated; (7) summer recovery — coordinator alone restores from backup on a fresh
host from the printed sheet, then completes checkout→issue→ready-pickup; (8) pilot gate audit (P4 a–f) before expansion.

## Open questions / user decisions (preserved, not decided here)

1. Replacement approver role + value/condition thresholds. 2. Caregiver direct reporting: none vs structured form vs
   portal + acknowledgment SLA. 3. District directory-information designation + opt-out list; caregiver-contact consent
   basis + retention. 4. Second language + liaison template-review workflow. 5. Hosting placement (district VM vs small
   VPS) within $8k. 6. Core selection (checkout vs stock-state vs lean backend) following maintainer capacity.
Uncertainty retained: Snipe-IT field-level contact visibility unverified; PocketBase OIDC/SSO unproven in fetched docs;
no performance/security-audit/load evidence claimed — scope is a small product pilot, not production guarantees.

## Method note

Investigator-complete under M15 v1 control (fresh full investigator; separate fresh full critic and fresh full reviser
stages follow; no nested agents in this stage). O1 (unfamiliar tools + different approaches), O2 (primary-source
defaults/limits/applicability), O3 (issue/fix/release chains with absent-evidence honesty), O4 (per-P disposition
above), O5 (this self-contained final retaining alternatives, conditions, disagreement, uncertainty), O6 (executed vs
proposed validations separated) are all addressed above from brief + primary sources + revealed P1–P6.
