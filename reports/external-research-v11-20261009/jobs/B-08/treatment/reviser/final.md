# I08 final — band instrument lending + repair coordination (M15 reviser)

Block B-08 / treatment / reviser / case I08 / method M15 v1 fresh-factored-verification-with-full-criticism.
Brief: `cases/I08/brief.md` (frozen sha256 ff13f85a…). Revealed plan: P1–P6 exact (see §1).
Predecessors read complete: `research/draft.md` (§§1–9), `research/discovery.md` (§§0–7),
`research/source-map.json` (S01–S14), `research/revealed-plan.md`,
`research/verification-questions.md` (Q1–Q3), `verifier/verification.md` + `verifier/source-map.json`
(S01–S26) + `verifier/sources/index.md`, `critic/critique.md` (M1–M14, minors m1–m10) +
`critic/source-map.json` (C01–C11) + `critic/sources/evidence.md` + `index.md`,
plus `research/sources/evidence.md` + `index.md`.
No campaign/history/evaluator/counterpart read. No nested agents. No repo/canon edits.
Reviser access window: 2026-10-09T21:19–21:35Z (own fetches R01–R05).
No runtime available. O6 separates executed doc checks from proposed validations.
Usage/billing null where unobserved.

Verdict: the investigator's primary recommendation (Grist pilot + asynchronous bilingual
notifier + deferred identity broker) survives. The independent verifier confirms all three
factored questions with stronger primary evidence than the draft cited, and the full critic
finds no false correction, no false rejection, and no disposition requiring reversal.
This final applies every material critic finding (M1–M14) and folds the verifier's
strengthenings into the per-P dispositions, alternatives, governing behavior, evolution
chains, and validations below. Nothing supported is dropped; three things are narrowed
or downgraded as the evidence requires (Redis hedge retired to confirmed; Archived
invariant scoped to the asset-lifecycle path; $8k fit downgraded to pending V8).
Full adjudication with accept/amend/reject/uncertain per finding is in §9.

## 1. Exact revealed plan (verbatim)

- P1: Track instrument assignment, reported issue, repair state, expected return, and availability for loan.
- P2: Limit student and caregiver details to staff who need them for a loan or repair handoff.
- P3: Provide large-print friendly screens and caregiver messages that can be prepared in two languages.
- P4: Support a small pilot that starts with one inventory room and selected schools.
- P5: Replacement approval and direct caregiver reporting are district program decisions.
- P6: The sign-in approach and any district system integration are not yet funded.

Disposition vocabulary (O4): correction (plan underspecified or wrong and must change),
optional enhancement (compatible addition), user decision (district must choose, both
branches buildable), already-covered (plan + discovery agree, no change), rejected
(discovery alternative not pursued with reason), uncertain (evidence absent or mutable,
validation required).

State vocabulary (reconciled per M5/m1): the repair machine has six states —
Intake, Diagnosed, Waiting-for-Parts, In-Repair, Ready-for-Pickup, Closed.
"Diagnosed-awaiting-decision" from the draft is folded into Diagnosed with a decision
sub-flag (awaiting-decision true/false), not a seventh state. Waiting-for-Parts and
Diagnosed-with-awaiting-decision both block availability for loan.

## 2. Recommended scope (self-contained)

### 2.1 Primary recommendation: Grist pilot + asynchronous bilingual notifier + deferred identity broker

For the single-inventory-room + few-schools pilot, self-host Grist as the system of
record, with tables for Instruments, Schools, Loans, Repairs, RepairEvents,
CaregiverContacts, and Users. Model repair as the explicit six-state machine from §1.
Waiting-for-Parts blocks availability for loan; Ready-for-Pickup does not auto-loan and
requires an explicit handoff. Track expected return as a date on the Loan; overdue is
defined as today past expected return while still checked out. Record availability as a
derived value from loan + repair state, never as a free-text flag. Excluded-from-queue
flags (including any archive-equivalent marker) must be explicit in every queue, filter,
and export definition; Grist has no framework-imposed Archived invisibility, so queue
correctness is a filter convention tested by V2.

Enforce student/caregiver minimization in Grist content access rules (table/column/cell
formulas on user attributes and row values), not in user-interface hiding alone.
Teachers see schedule, instrument identifier, school, loan status, and repair state, but
not caregiver phone/email unless the delay workflow needs it. Coordinators and the family
liaison see contact details. Never grant schema (structure) permission to teachers or
liaison, because that permission bypasses all other restrictions (formulas are not
sandboxed from data). Keep Home-database workspace sharing and Document content rules
both configured; sharing a document without content rules exposes protected details to
all viewers. Verify no teacher holds schema rights at install and re-check periodically
for role drift. Writes are audited through document history (with access-rule censoring)
and the notifier delivery log; per-row *read* audit ("who viewed this contact") is NOT
established for self-hosted Grist Core and is not promised — reads are enforced but not
logged unless the frozen deployment's installation-wide audit/SIEM coverage is verified
(residual risk recorded for the district; see M7 in §9 and V1 notes in §8).

Send caregiver delay messages through a separate scheduled workflow (self-hosted n8n or
equivalent) that scans overdue loans once per cycle, looks up caregiver locale, renders
one of two human-reviewed templates, sends via email first, logs delivery, and retries
idempotently. Do not machine-translate at send time. When locale is missing, fall back
to the liaison's primary language and flag for human follow-up. Batch the scan into one
execution per cycle rather than one execution per loan. Idempotency mechanism (M12):
dedupe key is loan ID + overdue-cycle ID; the delivery log records loan, cycle, locale,
template version, channel, delivery status, and a state-hash of the loan; a repeat run
in the same cycle with the same state-hash sends nothing; notification re-arms only on a
state change, defined as expected-return edit, loan-state transition, or caregiver-locale
fix; each per-recipient send-record is written before its send so a mid-batch crash
reruns without partial duplicates.

Start identity with local accounts plus multi-factor authentication and a printed
recovery runbook the liaison can execute while the district help desk is closed. The
runbook must cover the hard parts explicitly (M8): an MFA-reset path executable by the
liaison alone with its abuse guard (e.g. witnessed reset + cooldown + audit entry),
break-glass admin credential custody and rotation (e.g. sealed envelope in a safe with
logged openings and rotation after each use), session/token lifetimes set to bridge the
closure length, account-provisioning effort for many teacher accounts on two staff plus
a part-timer, plus password resets, backup/restore, and session handling. Defer district
single sign-on until funded. If single sign-on is needed before funding, add a
self-hosted identity broker (Authentik) federating the district provider once and
issuing standard tokens to the lending app, with break-glass local admins and database
backups. Do not promise district sign-in without a funded integration and a
claim-mapping test.

Operate the pilot on one small virtual server or district virtual machine with automated
backups. Print handoff sheets for the inventory room so summer operation does not depend
on the help desk. Expand from one room to more schools only when the handoff log shows
clean transfers, overdue detection works, and the repair queue correctly distinguishes
waiting-for-parts from ready-for-pickup.

Cost status (M10): the primary is *expected* to fit the $8,000 annual cap as self-hosted
software plus server, domain, certificates, backup, print, and admin-hours costs, with
email-based notifications — but this is pending the V8 itemized twelve-month total, not
a finding. No hosting or backup price was captured from a primary pricing source for
this stack. Short-message costs, if short messages are later required, need separate
validation for carrier opt-in and per-message price.

### 2.2 Why this primary, and what would change it

Grist is chosen over a generic spreadsheet-database because its access rules evaluate per
row, column, and cell on user attributes and row values, which is the only low-code
mechanism found in this time-box that directly implements "many teachers see the
schedule but not student/caregiver details" without a paid tier. Baserow and Directus —
the two most obvious low-code competitors for field/row permissions — were not
investigated in this time-box; the V1 redaction probe is product-agnostic and would
discriminate them (M13). The competing spreadsheet-database requires a paid license for
table/field-level permissions, teams, audit logs, and row-level security, which makes
its community edition unsuitable for that constraint unless the license is funded — and
the verifier strengthens this further: even where licensed, its table permissions govern
create/delete only and its field permissions govern edit only, neither controlling
visibility; only Scale+ record-level security hides rows.

The separate notifier is chosen because lending-record systems do not natively provide
locale-aware bilingual delay templates with delivery logging and idempotent retry. A
scheduled workflow does that portably across record systems.

Deferred identity is chosen because the brief and P6 both state integration is unfunded.
A broker adds a critical path that must be maintained during summer closure; local
accounts with a liaison-executable runbook are more resilient for a pilot.

This primary would change to the ERPNext alternative if the district needs native parts
consumption, downtime accounting, and replacement-approval workflow rather than a
lending log; to the dedicated lending-service alternative (at its Plus tier, given
item/contact/site caps — see M6) if the district prefers a hosted lending-native product
and accepts software-as-a-service dependence plus bilingual-template and field-visibility
validation; to the asset-lifecycle alternative if barcode asset discipline and exclusive
checkout are more important than per-event repair evidence; or to an offline-sync build
only if field testing proves in-class capture must write while fully offline.

## 3. O4 — Exact per-P disposition

### P1: Track instrument assignment, reported issue, repair state, expected return, and availability for loan.

Disposition: already-covered in intent; correction on repair-state semantics and
availability derivation; optional enhancements for labels and parts; one uncertainty on
per-event attachments.

Already-covered: instrument assignment (who has which instrument), reported issue
capture (teacher urgent report during class), repair state tracking, expected return
date, and availability for loan are all required and retained. No clause is dropped.

Correction C-P1a (required): "repair state" must be the explicit six-state enumeration
from §1. The brief's core pain is that binders cannot distinguish waiting-for-parts
from ready-for-pickup; a free-text or two-state field repeats that failure.
Waiting-for-Parts must block availability; Ready-for-Pickup must not auto-loan and must
require explicit handoff to a borrower or room.

Correction C-P1b (required): "availability for loan" must be derived from loan
exclusivity plus repair state, not stored as an independent editable flag. An instrument
checked out to one borrower cannot be checked out to another until checked back in. An
instrument in Waiting-for-Parts, In-Repair, or Diagnosed-with-awaiting-decision is not
available even if no loan row exists. On the asset-lifecycle (Snipe-IT style) path only,
an Archived-equivalent status must never be used for active repairs: Archived items show
only in the Archived view and vanish from queues (M5 scoping repair). On the Grist
primary there is no such framework behavior; the equivalent rule is the §2.1
queue-filter convention. Verifier detail carried in: the asset-lifecycle checkout path
is concurrency-guarded (row lock + re-check of availability inside the transaction), and
checkout target validation rejects soft-deleted targets before mutation.

Correction C-P1c (required): "expected return" is a date on the loan; "overdue" is today
past expected return while still checked out. Overdue detection runs server-side on the
record system, not on offline clients, so summer or disconnected capture does not miss
delays.

Retained findings: exclusive checkout prevents double-booking replacement instruments;
unique instrument identifier per system (serial reused as identifier or auto-increment,
with school as a location/relation rather than baked into the identifier so cross-school
transfers do not break uniqueness); repair notes plus file evidence per repair event;
location model with an explicit unavailable repair/cleaning location so items under
repair cannot be lent.

Optional enhancement E-P1a: barcode/QR labels for the inventory room (asset-tag style)
to speed intake, handoff, and audit. Compatible with any record system; labels encode
the instrument identifier only, never student data.

Optional enhancement E-P1b: parts-aware repair (only if ERPNext path chosen): record
consumed parts so cost is included and inventory reduced through the supported repair
workflow; record downtime and possible capitalization per repair. Do not model
waiting-for-parts as a planned-maintenance log; planned maintenance and failure repair
are distinct. Verifier nuance carried in: stock-item consumption still runs when set even
for fully depreciated repairs (quantity decrease + cost tracking); only the value/life
increment is suppressed.

Uncertain U-P1: per-event attachment pinning on the asset-lifecycle path. The
asset-lifecycle checkout/checkin programming interface accepts only text fields
(checkout: target selectors, status, dates, note, name, requestable flag; checkin: note,
name, location, status, checkin date), while file uploads attach to the asset globally
as new `uploaded` log entries rather than to a specific checkout/checkin log entry. That
gap is open with no fix observed (issue filed 2026-06-11, still open at verifier access;
audit is the contrast — only audit accepts a file stored on its own log entry). Path
note: current routes expose uploads as `POST {object_type}/{id}/files`; the
`/uploads` wording in the issue text is stale shorthand — the functional gap (global,
not per-event) is confirmed either way. Model-fieldset custom values on checkin/checkout
forms exist on the model but API write-through is unverified. If the pilot needs damage
photos pinned to a specific loan/repair event via that interface, choose the Grist
file-column-per-repair-row, lending-service repair-upload, or ERPNext repair-attachment
path instead, and validate pinning survives the next loan (V2).

Rejected R-P1: spreadsheet "status" column with no state machine and no availability
derivation. Rejected because it preserves the binder failure and permits double-booking.
(This rejects the flat column, not phased delivery: the pilot still phases by school
and room.)

### P2: Limit student and caregiver details to staff who need them for a loan or repair handoff.

Disposition: already-covered in intent; correction on enforcement layer and on the
unsuitable community path; uncertainties on portal field redaction and license drift;
read-audit downgraded per M7.

Already-covered: store only instrument identifier, school, loan status, repair notes,
expected return, and a caregiver contact path for delays; keep student details minimal;
store no grades or disciplinary data. Many teachers see the schedule; only
handoff-necessary staff see student/caregiver details.

Correction C-P2a (required): enforce by content-level rules, not interface hiding.
Teachers with schedule access must be denied caregiver phone/email and extended student
fields at the data-rule layer, with coordinator and liaison granted. Interface filtering
alone is insufficient because API, exports, and connected apps bypass it.

Correction C-P2b (required): do not use the community spreadsheet-database path for this
constraint without its paid license. Its community/unlicensed tier defaults programming
tokens to all-resources access with no expiry, shows the token only once, and gates
table/field-level permissions, row-level security, teams, audit logs, and single sign-on
to paid tiers (Business+ for table record permissions and field permissions and SSO
workspace configuration; Scale+ for record-level security, workspace teams, workspace
audit logs, and table visibility). This correction now stands on official product
documentation (M2), not forum opinion. The verifier strengthens it decisively: table
permissions govern create/delete only, field permissions govern edit only — neither
hides data; only record-level security hides rows, and it is Scale+ only. Additional
leak paths carried in: hidden tables still leak through relational display values and
Lookup/Rollup values; record-level security without a Default Deny-all policy leaves
unmatched users on Show-all; tokens cannot exceed the creator's role, so an
over-privileged creator plus an all-resources Community token is full access with no
expiry; enabling SSO silently invalidates pre-SSO tokens (they must be regenerated
after SSO sign-in). Workspace-level separation is now available to self-host, but that
does not redact columns or rows for many-teacher visibility. If that product is chosen,
fund and verify the license and re-test redaction; otherwise use the Grist content-rule
path or a portal with verified field permissions.

Retained conditions: least-privilege sharing (grant only needed tables/rows/columns;
scopes restrict and never expand what the authorizing user can do); no owner-level
programming keys on teacher devices (prefer scoped, revocable integrations); no
schema/structure permission for teachers or liaison (with periodic re-check for role
drift); overdue notifier reads contacts server-side and never exposes the full contact
table to teachers. Writes and notifications are audited (document history +
delivery log); per-row read audit is not promised unless the frozen deployment's
installation-wide audit coverage is verified (M7).

Uncertain U-P2a: caregiver-portal field redaction on the ERPNext/lending-service paths.
Portal scope can implement "caregivers see only their own rows," but no captured
evidence proves field-level portal visibility per row for this schema. Validate with two
caregivers and two students before enabling direct caregiver access (V9).

Uncertain U-P2b: exact license cost and audit-log retention for the gated
spreadsheet-database tier. Pricing and license boundaries are mutable; re-verify at
procurement. Treat earlier list prices as non-binding.

Rejected R-P2: "one shared login for all teachers" and "hide columns in the view." Both
rejected: the first destroys audit and least privilege; the second is bypassable via
API/exports.

### P3: Provide large-print friendly screens and caregiver messages that can be prepared in two languages.

Disposition: already-covered in intent; correction on what "large-print friendly" and
"two languages" mean as buildable requirements; narrowed uncertainty on the hosted
lending-service bilingual behavior.

Already-covered: some teachers use large-print screens; the family liaison needs
messages in two languages. Both retained as release-blocking acceptance, not
nice-to-have.

Correction C-P3a (required): "large-print friendly" is a platform requirement, not an
app theme. Build with relative type units, reflow without clipped text or horizontal
scrolling to complete loan, repair-queue, and issue-form tasks, visible focus
indicators, keyboard-only operability, and sufficient contrast. Fixed-pixel canvas or
table widgets that clip at large sizes fail. No captured product provides a distinct
"large-print mode"; the requirement is met by layout and style discipline plus testing
with operating-system large text and browser zoom. Grounding (M11): the reflow half is
grounded in WCAG 2.2 Success Criterion 1.4.10 Reflow (Level AA) — content presentable
without loss and without two-dimensional scrolling at 320 CSS pixels width (equivalent
to 1280 pixels at 400% zoom), except parts requiring two-dimensional layout for usage
or meaning; the 200% browser-zoom minimum used in V5 is an adopted design standard and
practical proxy (weaker than the 400% criterion), together with relative units, visible
focus, keyboard operability, and contrast as the acceptance list.

Correction C-P3b (required): "two languages" means two human-reviewed message templates
selected by caregiver locale, with explicit fallback and delivery logging — not machine
translation at send time and not ad-hoc staff translation per message. Repair notes
remain in the staff working language; the caregiver message is a liaison-approved
summary in the caregiver's language. Missing locale falls back to the liaison's primary
language and flags for human follow-up. Duplicate sends on retry are suppressed by the
§2.1 idempotency mechanism (dedupe key loan + cycle; re-arm only on defined state
change; per-recipient send-record before send).

Retained conditions: locale stored per caregiver contact; template versions reviewed by
the liaison; overdue scan batched (one scheduled run scanning all loans, not one run per
loan) so hosted automation caps do not exhaust; email first; short messages only after
opt-in, sender-identity, and per-message cost validation.

Uncertain U-P3 (narrowed per M6): site/member-portal language choice on the hosted
lending-service EXISTS (member-site language choice, member personal language choice,
content translation rows, and a languages page are all observed). What remains
unconfirmed is specifically (a) per-caregiver message-template locale selection for
delay/reminder notices, (b) template fallback behavior, and (c) reminder idempotency.
If that path is chosen, validate those three against the languages and
reminder/message-template docs before committing.

Rejected R-P3: automatic translation of repair notes or delay notices at send time.
Rejected for mis-communication risk on return dates, pickup instructions, and
liability-adjacent repair language.

### P4: Support a small pilot that starts with one inventory room and selected schools.

Disposition: already-covered; optional enhancements for enablement, transfers, and exit
criteria; no correction to the pilot-first direction.

Already-covered: begin with a single inventory room and a few schools; expand only if
handoffs are clear. Retained exactly. Pilot scope is one room, two to three schools,
the two music staff, the part-time coordinator, a small teacher group, and the liaison.

Optional enhancement E-P4a: per-location enablement. Model schools and
storage/repair locations as data, with a pilot flag per school/location. Non-pilot
schools see a read-only "coming soon" or no access rather than a broken half-workflow.
Unavailable repair/cleaning locations are first-class so items under repair cannot be
reserved.

Optional enhancement E-P4b: transfer/handoff log. Every movement between room, school,
borrower, and repair location writes who handed to whom, when, and in what state, with
expected return carried or reset explicitly. Expansion is gated on this log being
complete and legible, not on anecdote.

Optional enhancement E-P4c: pilot exit criteria (all must pass before adding schools):
overdue detection fired correctly for two weeks (as defined by V3); waiting-for-parts
vs ready-for-pickup never confused in the queue; teacher urgent-report to coordinator
triage latency measured during the pilot against a district-confirmed target — the
one-school-day figure is a proposed default for district confirmation, not a brief
requirement (M9); no caregiver contact exposed to out-of-scope teachers in the redaction
probe; large-print pass on the three core screens; backup/restore demonstrated from
documentation without helpdesk help.

Rejected R-P4: nine-school big-bang launch. Rejected as incompatible with "expand only
if handoffs are clear" and with summer low-support operation.

Uncertainty: none material on P4 direction; scale costs (hosting, automation runs,
short messages, tier caps) remain to be measured in the cost probe.

### P5: Replacement approval and direct caregiver reporting are district program decisions.

Disposition: user decision (both items); no correction; both branches preserved as
configuration with stated consequences.

User decision D-P5a: who can approve a replacement instrument. Branch 1: coordinator or
music staff approves (fast, low overhead, suitable for pilot). Branch 2: district
program owner approves (slower, auditable, suitable if replacements carry budget or
equity implications). Either branch is implementable as an approval role plus a
replacement-request state (Requested, Approved, Denied, Fulfilled). The choice changes
queue design and notification recipients but not the record schema. No default is
assumed; the pilot runs with an explicit interim approver documented as interim until
the district decides.

User decision D-P5b: whether caregivers can report a problem directly. Branch 1
(closed): only staff/teachers file issues; caregivers contact the liaison, who files.
Lower moderator load, lower portal-exposure risk. Branch 2 (open): caregivers file
through a scoped portal showing only their own loans, with coordinator triage before
repair creation. Higher convenience, higher need for portal redaction validation,
spam/abuse handling, and bilingual form strings. Both branches use the same
issue-to-repair triage (urgent report becomes a tracked issue, coordinator creates or
links a repair draft, technician assignment and expected downtime recorded). The brief's
"have not decided" is preserved; the build does not bake in one branch.

Conditions retained: whichever branch is chosen, the repair state machine, overdue
logic, minimization rules, and pilot exit criteria do not change. Direct caregiver
reporting, if opened later — including post-pilot — requires re-running the
portal-redaction probe (V9) and the bilingual-form probe before go-live (emphasized per
minor m9).

No rejection: neither branch is rejected. No uncertainty beyond the district's pending
choice plus the stated validation load that Branch 2 carries.

### P6: The sign-in approach and any district system integration are not yet funded.

Disposition: already-covered; correction that unfunded means no promised integration;
optional enhancement for a broker path with explicit summer-operations cost.

Already-covered: existing district sign-in requirements may apply, but a formal
integration request has not been funded. No district integration is promised in the
pilot. No grade, discipline, or roster sync is built.

Correction C-P6a (required): treat "may apply" as a validation gate, not a build task.
The pilot ships with local accounts, multi-factor authentication, least-privilege roles,
and the printed recovery runbook from §2.1 (MFA-reset path with abuse guard,
break-glass custody + rotation, session lifetimes bridging the closure,
provisioning-effort estimate, password resets, backup/restore, session handling),
executable by the liaison without the help desk. District sign-in is a funded follow-on
with a claim-mapping test (at minimum mailbox, given name, surname, and any
employee/department attributes the record system expects), not a configuration toggle.

Optional enhancement E-P6a (only if pre-funding single sign-on is required):
self-hosted identity broker federating the district provider once and issuing standard
sign-in tokens or directory binds to the lending app, with proxy sessions for apps
lacking native sign-in. Since the 2025.10 change — officially confirmed in the 2025.10
release post (M3), no longer merely reported — the broker needs only its database
(caching and WebSocket migrated to Postgres; tasks since 2025.8), reducing moving parts
to server + worker + database. Broker configuration includes explicit server address,
port/scheme, certificate validation, base/bind distinguished names for directory binds,
and attribute maps for single sign-on. Edge must block forged identity headers so only
the broker can assert identity. Pin the exact build version and file paths at freeze
(a later 2025.12 change moved local storage from `/media` to `/data`). This path adds
a critical service that must survive summer closure with long-lived sessions,
break-glass admins, and tested database restore. Cost is server plus domain/certificates
plus admin time; no per-user fee was observed (pending V8 itemization).

Uncertain U-P6: the exact district provider (education workspace vs directory),
required claim set, and whether directory bind or modern token sign-in will be
accepted; plus which exact post-2025.10 build to pin. The Redis-existence question is
retired (officially confirmed); the version-pin and path-pin halves remain and must be
re-verified at build freeze.

Rejected R-P6: building roster/grade/discipline sync or enrolling in a paid
directory-integration SKU during the pilot. Rejected as out of scope, unfunded, and
incompatible with data minimization.

## 4. O1 — Alternatives retained (do not collapse to identifiers)

Four buildable alternatives plus two infrastructure choices are retained with the
conditions under which each wins.

Alternative 1 — Asset-lifecycle record system (Snipe-IT style). Strengths: unique asset
tags, exclusive checkout preventing double-booking (concurrency-guarded in code),
four-behavior status labels, label printing, programming interface for checkout/checkin
with expected return, directory/single-sign-on settings. Wins when barcode discipline
and exclusive loans matter most and repair can be modeled as statuses plus notes. Loses
on per-event repair evidence via programming interface (text-only checkout/checkin;
uploads attach globally as separate entries, open gap confirmed by verifier code reads
and the still-open feature request) and on teacher field redaction (role/field
visibility not proven at field level). The Archived-vanishes-from-queues rule applies
here (M5). Needs the same bilingual notifier and large-print discipline as the primary.
Cost: self-hosted PHP + MySQL with no per-seat license observed; expected to fit, pending V8.

Alternative 2 — Hosted lending-native service (Lend-Engine style). Strengths: lending
vocabulary (reservations, renewals, reminders, member self-serve), maintenance schedules
(ad-hoc or after every loan), multi-location with unavailable repair/cleaning locations,
repair assignment with notes/uploads, list pricing within budget with unlimited loans on
all tiers. Tier facts (M6, independently re-confirmed): Free / Starter $12.50 / Plus $25
/ Business $50 per month; unlimited loans/month on all tiers; items AND contacts capped
at 100 / 500 / 2,000 / 10,000; sites 1 / 1 / 10 / 30. For nine schools, Starter (1 site,
500 items) is almost certainly insufficient — Plus ($25/mo, 10 sites, 2,000 items) is
the plausible nine-school tier, still within $8k/year as a line item ($300/year) but a
different line than Starter; instrument-plus-contact counts must be checked against
2,000 in V8. Site/member-portal language choice exists; per-caregiver message-template
locale, fallback, and reminder idempotency remain unconfirmed (narrowed U-P3). Wins for
fastest time-to-pilot and lowest admin burden. Loses on software-as-a-service dependence
during summer closure (needs export, service-level understanding, and an offline
urgent-capture fallback), on the narrowed bilingual-template uncertainty, and on
unconfirmed field-level member-data visibility. Validate all three before committing.

Alternative 3 — Full repair-native planning system (ERPNext/Frappe style). Strengths:
only path with native planned-maintenance vs failure-repair distinction, consumed-parts
inventory reduction with cost, downtime and capitalization handling, issue-to-repair
draft triage with technician assignment and expected downtime, portal, and translations.
Since the v15/v16 repair releases (v15.117.0 and v16.28.0, both 2026-07-15), repairs work
for fully depreciated assets with capitalization locked off — the normal
school-instrument case; server-side validation zeroes capitalize-repair-cost and
life-increase for Fully Depreciated assets (derived status, robust to the transient
Out-of-Order flip), the form marks the field read-only as a UX layer, Sold/Scrapped
assets remain unrepairable, and the Repair button is present on the Asset form in both
versions. Wins when parts, downtime, replacement approvals, and portal/i18n are all
required. Loses on operational weight (application server, database, background workers,
domain knowledge) for a two-staff pilot; cost expected to fit only with existing
infrastructure or a small server plus costed admin time — "volunteer admin" is not a
budget line and is dropped unless costed (M10). Note v16 also differs in surrounding
repair-invoice handling (multi-invoice child table vs v15 single invoice); test invoice
edges per version.

Alternative 4 — Community spreadsheet-database on existing relational database (NocoDB
style). Strengths: familiar grid over Postgres/MySQL, fast tables/views, workspace
separation now in self-host, unlimited records/seats as reported. Wins when the district
already runs a relational database and wants a grid front end. Loses decisively on P2
without a paid license (field/column/row redaction, teams, audit, single sign-on gated;
official license docs confirm Business for table/field permissions + SSO + teams, Scale
for audit + row-level security + team hierarchy), and community tokens default to
all-resources with no expiry. The verifier's strengthening applies in full: licensed
table permissions are create/delete-only and field permissions edit-only — visibility
hiding needs Scale+ record-level security with a Default Deny-all policy. Only viable
for minimization if the license is funded and redaction re-tested.

Infrastructure choice A — Offline-sync engine (PowerSync style over Postgres). Real
offline writes with local SQLite reads, row-partitioned sync rules per school, real-time
streaming when connected. Wins only if in-class capture must write with no
connectivity. Costs: sync service, logical replication, client build, sync-rule security
review, conflict design for concurrent loan/return, and no peer-to-peer local-network
sync when fully offline. Governing caveat retained: the upload routine runs only while
the sync stream is connected, so offline writes buffer indefinitely and coordinator
queues must never depend on offline clients; queued-vs-sent labels are mandatory. For
most pilots, a simpler "online form plus queued outbox with explicit queued-vs-sent
labels" suffices; server-side overdue scans remain authoritative. (Node-SDK stable/beta
tag ambiguity is honestly flagged; the web-first pilot avoids the question.)

Infrastructure choice B — Automation runner for notifications (n8n style). Self-hosted
unlimited runs; hosted tiers metered by executions. Official pricing independently
re-confirmed (M1): all plans include unlimited users and workflows with every
integration, priced by monthly workflow executions; Starter 20€/month annual for 2,500
executions, Pro 50€/month annual for 10,000; self-hosted Community free with unlimited
executions (server cost only). Bills in EUR; older USD figures are stale or converted —
V8 must re-verify currency and annual-vs-monthly at procurement. Wins as the portable
bilingual notifier across any record choice. Must batch scans (one execution per cycle).
License is free for internal self-hosted business use with restrictions on
resale/embedding. Short-message delivery still needs opt-in and cost validation.

Disagreement retained: low-code primary vs repair-native completeness. The primary
optimizes for pilot speed, minimization without a license, and summer operability. The
repair-native path optimizes for parts/downtime/portal/i18n correctness at higher
operational cost. Both are buildable; the cost and redaction probes discriminate.

## 5. O2 — Governing behavior carried into the build

- Loan exclusivity and availability derivation (§3 P1) are invariants, not conventions.
  Double-booking is prevented by state, and availability is computed. On the
  asset-lifecycle path the checkout transaction is concurrency-guarded and rejects
  soft-deleted targets.
- Repair states Waiting-for-Parts (blocks loan) and Ready-for-Pickup (requires handoff)
  are mandatory and visually distinct in every queue, filter, and export.
  Diagnosed-with-awaiting-decision also blocks loan (§1 reconciliation).
- Expected return is a date; overdue is computed server-side daily; the notifier is
  idempotent per loan per cycle under the §2.1 mechanism (dedupe key, log schema,
  defined re-arm conditions, crash-safe send-records).
- Minimization is enforced at the data-rule layer with least privilege; programming keys
  are scoped and revocable; schema/structure rights are admin-only with periodic
  re-check; contact access enforcement is tested (V1); per-row read logging is not
  promised without verified deployment audit coverage (M7).
- Webhook/callback targets from a self-hosted record system are allowlisted by domain;
  unlisted targets fail closed rather than silently dropping notifications.
- Directory/single-sign-on bindings pin server, port/scheme, certificate validation,
  base/bind names, and attribute maps; missing mailbox claim breaks sign-in rather than
  creating a broken profile. Enabling SSO on the spreadsheet-database path silently
  invalidates pre-SSO tokens (regenerate after SSO sign-in).
- Licensed spreadsheet-database visibility rules, if that path is ever chosen:
  table-permission edits do not hide records, field-permission edits do not hide fields;
  row hiding needs Scale+ record-level security with a Default Deny-all policy; hidden
  tables still leak via relational display and Lookup/Rollup values.
- Sync rules, if offline sync is built, filter every row by school/tenant from validated
  claims, never from client-supplied values; offline writes show queued vs synced;
  coordinator queues never depend on offline clients; no peer-to-peer sync when fully
  offline.
- Units: downtime in minutes at entry and hours in analysis where that product is used;
  repair service-levels in days; expected return as calendar date. Mixed units are a
  defect. (Downtime unit claim carried with V7/unit-check validation.)
- Large-print and bilingual rules from §3 P3 are acceptance gates, not styling
  suggestions. Reflow is grounded in WCAG 2.2 SC 1.4.10 (M11); the 200% zoom minimum is
  the adopted operational proxy.

## 6. O3 — Evolution chains carried into the build

- Fully-depreciated repair fix (applicable, retained and doubly confirmed): the
  repair-native product's v15.117.0/v16.28.0 releases (both 2026-07-15) allow repair
  records for fully depreciated assets with capitalization locked and no value/life
  change; release sentence confirmed verbatim and server logic confirmed at both pinned
  tags (zeroing in validation; read-only form guard is UX only; Sold/Scrapped still
  blocked; Repair button present in both versions). PR lineage 55276 (develop) →
  backports 57110 (v15) / 57077 (v16) is noted, but V7 tests behavior on the frozen
  line/version rather than asserting PR numbers (M4). School instruments are routinely
  fully depreciated, so this fix is what makes that path viable. Verify the
  depreciation-error path (error log plus notification to the configured role or account
  managers) does not block repair submission.
- Checkout/checkin attachment gap (open, retained): the asset-lifecycle programming
  interface remains text-only for checkout/checkin, with uploads attaching globally as
  separate entries rather than per event. No fix observed (open since 2026-06-11). Do
  not promise per-event photo pinning on that path. Upload-path wording: current routes
  use `POST {object_type}/{id}/files` (since v8.1.17); `/uploads` in the issue text is
  stale shorthand.
- Workspace separation now in self-host (partial, retained): the community
  spreadsheet-database's 0.301.5-equivalent release brings workspace access control to
  self-host with existing access preserved, but field/row redaction remains gated. The
  O4 correction on P2 stands, strengthened by the verifier's edit-vs-visibility
  distinction.
- Broker simplification (officially confirmed, M3): the identity broker no longer
  requires a separate cache service since the 2025.10 change (tasks to Postgres since
  2025.8; caching and WebSocket to Postgres in 2025.10), needing only its database —
  minimum stack server + worker + PostgreSQL. Confirmed on the official 2025.10 release
  post, not merely reported. Fewer summer moving parts. Pin the exact build version and
  file paths at freeze (2025.12 moved local storage from `/media` to `/data`).
- Offline upload buffering (documented behavior, retained): the sync engine calls its
  upload routine only while the sync stream is connected; offline writes buffer
  indefinitely and preview tests cover only local behavior. Design queued-vs-sent labels
  around it; no fix is expected.

Where evidence was absent (hosted lending-service message-template locale/fallback/
idempotency, portal field redaction, short-message pricing/opt-in, broker version pin
and district claim set, managed API caps, license list prices), this final states
uncertainty and assigns a validation rather than assuming an answer.

## 7. O5 — Constraints, conditions, and uncertainty (single coherent final)

Original constraints preserved: $8,000 annual cap; nine schools eventual, pilot-first;
two music staff plus part-time coordinator plus in-class teacher capture; summer
operation without the help desk; six-field record plus caregiver contact on delay;
minimal student data, no grades/discipline; large-print; two-language caregiver
messages; explicit waiting-for-parts vs ready-for-pickup; undecided replacement approver
and caregiver direct reporting; unfunded sign-in/integration.

Conditions: pilot-first with per-location flags and a transfer log; content-rule
minimization with least privilege and periodic schema-rights re-check; human-reviewed
bilingual templates with locale fallback and the §2.1 idempotency mechanism;
local-accounts-plus-runbook identity (with MFA-reset, break-glass custody, session
lifetimes, provisioning estimate) until funded; server-side overdue detection; print
fallback for the inventory room; expansion only on exit criteria with a
district-confirmed triage target.

Uncertainty (validation-bound, §8): hosted-service message-template locale/fallback/
idempotency (narrowed — site i18n exists); portal field redaction; short-message
cost/opt-in; broker version/path pin and district claim set; managed API caps and
license pricing drift; per-event attachment pinning on the asset path; deployment audit
coverage for any read-audit promise. None blocks the primary pilot as specified here;
each blocks the alternative or enhancement it guards.

Disagreement retained: low-code primary vs repair-native completeness (§4); no other
live disagreement — verifier, critic, and investigator converge on all three factored
questions and all per-P dispositions, with the repairs in §9.

## 8. O6 — Validations: executed vs proposed

Executed (documentation reads only; no code run, no container started, no login tested,
no accessibility tool run):

Investigator E1–E8 as reported (2026-10-09T21:00–21:10Z): asset-lifecycle overview;
checkout/checkin attachment-gap issue; relational low-code access rules, webhook
allowlist, Home vs Document authorization, schema-bypass and key-scoping guidance;
spreadsheet-database token defaults, collaboration precedence, workspace-release note,
and license-gating report; repair-native maintenance-vs-repair docs, repair-with-parts/
downtime docs, and fully-depreciated repair releases; broker self-host/integration/
proxy patterns and simplification report; sync-engine intro, upload-only-while-connected
behavior, offline-read guarantee, backend/SDK matrix, and no-local-network-sync limit;
lending-service features/pricing and automation execution/license/pricing notes.

Verifier reads as reported (2026-10-09T21:12–21:14Z): eight NocoDB official docs pages
as Markdown (roles, table/field permissions, record-level security, teams, workspace
audit, auth/SSO, API tokens); Snipe-IT master code snapshots (checkout request, API
routes, checkout/checkin/audit controller, upload controller, upload linkage, checkout
model) against the v8.8.0 release anchor; ERPNext pinned-tag files at v15.117.0 and
v16.28.0 (repair logic, repair form, asset button, derived status) plus both release
records and PR lineage. No staging instance, no witness run.

Critic reads as reported (2026-10-09T21:12–21:16Z): complete own-arm predecessor set
plus eleven independent sources (Grist rules live fetch; Snipe-IT issue; ERPNext
release verbatim + second-PR caution; NocoDB official license docs; n8n 2026
pricing/license guides; Authentik official 2025.10 posts; PowerSync integration docs;
Lend-Engine pricing live fetch; Baserow-vs-NocoDB guide).

Reviser reads (2026-10-09T21:19–21:25Z, this stage): complete predecessor set above
plus four independent primary fetches and one scoped search — official n8n pricing
(EUR executions, R01), official Authentik 2025.10 release post (Redis removal, R02),
Lend-Engine pricing live matrix (caps + language rows, R03), WCAG 2.2 Reflow criterion
(R04), Grist audit-capability search (R05). No code executed; fetches were read-only.

Proposed (discriminating, small-scope; each can falsify a choice; none has run):

- V1 Field-redaction probe (P2): two schools × two instruments × two students with
  caregiver contacts; Teacher-A (School-A) must not read School-B rows or any caregiver
  phone/email, while coordinator can. Tests enforcement, not read-audit; pair with a
  distinct deployment-audit check if any read-audit promise is kept (M7). Falsifies
  record-system choice and rule configuration. Product-agnostic: would also discriminate
  Baserow/Directus (M13).
- V2 Repair-state probe (P1): move one instrument through Intake → Waiting-for-Parts
  (loan blocked) → Ready-for-Pickup (handoff required) → Checked-out using the §1
  reconciled names, with Diagnosed decision sub-flag exercised; attach damage evidence
  via the intended interface and prove it remains pinned to that repair after the next
  loan; prove excluded-from-queue flags behave in every queue/filter/export. Run per
  chosen path (Grist file-column vs lending-service upload vs ERPNext attachment).
  Falsifies state machine and attachment path.
- V3 Overdue bilingual probe (P1/P3): set two overdue loans with different caregiver
  locales; run the notifier once; prove exactly two messages, correct locale, logged
  delivery, no duplicate on rerun (same state-hash), re-arm only on defined state
  change, and fallback with human flag when locale is missing; kill a run mid-batch and
  prove rerun sends only the missing recipients. Falsifies batching, templating,
  idempotency mechanism.
- V4 Summer-closure probe (brief/P4/P6): disable helpdesk-dependent recovery for a day;
  prove teacher urgent capture still works (online, or queued with an explicit queued
  label), coordinator triage completes with latency measured against the
  district-confirmed target (TBD, one-school-day proposed default), sessions survive,
  break-glass admin plus backup/restore work from the printed runbook, and an MFA-loss
  recovery drill succeeds via the liaison-alone reset path (M8). Falsifies
  hosting/identity/offline choice.
- V5 Large-print probe (P3): operating-system large text plus 200% browser zoom (adopted
  minimum proxy for WCAG 2.2 SC 1.4.10 reflow) on schedule, repair queue, and issue
  form; prove no clipped text, no horizontal scrolling to finish tasks (except
  genuinely two-dimensional parts), visible focus, keyboard-only completion. Falsifies
  layout/style approach. Pass/fail thresholds cite R04 (M11).
- V6 Broker probe, only if broker chosen (P6): federate a test district-like provider
  on the pinned build; prove token, assertion, directory-bind, and proxy paths; prove
  forged-header rejection, certificate enforcement, and database-restore recovery with
  pinned paths. Falsifies broker topology.
- V7 Depreciation-repair probe, only if repair-native chosen (P1/O3): fully depreciate
  a test asset; prove repair submits with capitalization locked and no value/life
  change, that a depreciation posting error does not block repair, and that
  Sold/Scrapped still throws; run behavior-level on the exact frozen line/version
  (v15 vs v16 invoice edges tested per version), asserting behavior not PR numbers
  (M4). Falsifies that path's applicability.
- V8 Cost probe (brief): twelve-month itemized total (hosting, licenses, messages,
  backup, domain/certificates, print, admin hours) at nine-school scale against $8,000
  with year-two renewal headroom; use capped hosted tiers (Plus as the nine-school
  candidate: instrument-plus-contact counts vs 2,000, sites vs 10) and EUR pricing
  re-verified at procurement; cost admin time explicitly (no volunteer-admin line).
  Falsifies hosted-vs-self-host and message-channel choices. Pre-claims of fit are
  withdrawn pending this probe (M10).
- V9 Portal probe, only if caregiver direct reporting is opened (P5): two caregivers
  each see only their own loans, file in both languages, and cannot enumerate other
  students; coordinator triage still gates repair creation. Must re-run if Branch 2
  opens post-pilot. Falsifies portal scope and bilingual-form readiness.

Verifier-proposed checks folded in (not executed; need staging): NocoDB
Community-vs-licensed matrix check with Default Deny-all and scoped-token 403 negative
(V1 companion); Snipe-IT checkout/checkin-file negative test with audit positive
control (V2 companion); ERPNext fully-depreciated zeroing test across both tags with
non-depreciated positive control and Sold/Scrapped throw (V7 companion).

No proposal is reported as run. "No runtime available" is the honest executed state.

## 9. Adjudication record (every criticism, every verification question)

Neither reviewer is authority; each finding was checked against primary evidence.
Reviser codes: ACCEPT (apply as written), AMEND (apply with stated change),
REJECT (decline with reason), UNCERTAIN (evidence absent; validation assigned).

Critic findings:

- M1 (n8n source upgrade + EUR drift): ACCEPT. Investigator's execution figures hold;
  S12 (hosting-affiliate guide) is non-primary. Reviser independently fetched official
  n8n.io/pricing (R01): Starter 20€/month annual for 2,500 executions, Pro 50€/month
  annual for 10,000, all plans unlimited users/workflows/integrations priced by monthly
  executions. EUR billing confirmed; USD figures stale/converted. Applied in §4 Infra-B
  and V8. V8 re-verifies currency at procurement.
- M2 (NocoDB gating on official docs): ACCEPT. C-P2b stands and is re-cited to official
  license documentation (Business: SSO, table/field permissions, teams; Scale: + audit,
  row-level security, team hierarchy), corroborated by the verifier's eight official
  docs pages fetched independently as Markdown. Verifier strengthening folded in
  (edit-only vs visibility). U-P2b (list prices) retained as uncertain.
- M3 (Authentik no-Redis officially confirmed): ACCEPT. Reviser independently fetched
  the official 2025.10 release post (R02): "Removed Redis dependency … All features
  that relied on Redis are now handled by PostgreSQL … fully removing the need for
  Redis." O3-d upgraded from "reported" to officially confirmed; minimum stack server +
  worker + PostgreSQL. U-P6 narrowed: existence retired, version-pin and path-pin
  (/media → /data in 2025.12) retained. Applied in §6 and E-P6a/V6.
- M4 (ERPNext fix verbatim + PR caution): ACCEPT. Release sentence confirmed verbatim
  (critic C03; verifier S16/S17 pinned tags) and server logic confirmed at both tags
  (verifier S18/S19). PR lineage noted (55276 → 57110/57077) but V7 asserts behavior
  on the frozen line/version, not PR numbers. v16 multi-invoice edge noted for
  per-version testing. Applied in §6 and V7.
- M5 (attachment gap holds; Archived scoping + state names): ACCEPT (both halves).
  Gap confirmed by verifier code reads (text-only checkout/checkin; uploads create new
  `uploaded` entries; only audit stores a file on its own entry) and the still-open
  issue. Archived-vanishes rule scoped to Alternative 1 only; Grist equivalent restated
  as the §2.1 queue-filter convention. State names reconciled to six states with a
  Diagnosed decision sub-flag (§1); V2 uses reconciled names. Upload-path wording note
  (`/files` current, `/uploads` stale shorthand) and custom-field API unverified flag
  carried in.
- M6 (Lend-Engine caps + narrowed U-P3): ACCEPT. Reviser independently fetched pricing
  (R03): tiers, unlimited loans, item/contact caps 100/500/2,000/10,000, sites
  1/1/10/30, language rows (member-site choice, personal choice, content translation),
  `/features/languages` nav — matching the critic. U-P3 narrowed to message-template
  locale + fallback + idempotency; Plus identified as the plausible nine-school tier;
  V8 requires cap headroom and count-vs-2000 checks. Applied in §3 P3, §4 Alt-2, §8 V8.
- M7 (read-audit ungrounded): ACCEPT (amend as downgrade, option b). No predecessor
  source establishes per-row read audit on self-hosted Grist Core; reviser search (R05)
  finds installation-wide audit/SIEM streaming plus document history with
  access-rule-censoring hints — write/activity coverage, not per-row read logging. This
  final promises enforcement + write/notification audit and records the residual risk;
  read-audit becomes a verify-or-drop item for the frozen deployment. Applied in §2.1,
  §3 P2, §5, V1.
- M8 (MFA/runbook underspecified): ACCEPT. C-P6a extended with the four required
  elements (MFA-reset path + abuse guard; break-glass custody + rotation; session
  lifetimes vs closure; provisioning effort) and V4 gains an explicit MFA-loss drill.
  Local-first direction unchanged; broker asymmetry (IdP outage = total lockout)
  preserved. Applied in §2.1, §3 P6, §8 V4.
- M9 (invented triage SLA): ACCEPT. The one-school-day figure is labeled a proposed
  default for district confirmation and the threshold moves to V4 measurement (TBD);
  other exit criteria kept; overdue criterion cites V3. Applied in §3 P4 and V4.
- M10 ($8k fit unitemized): ACCEPT. "Fits $8k" downgraded to "expected to fit; pending
  V8 itemized TCO" for every path including the primary; ERPNext "volunteer admin"
  clause dropped unless costed; V8 specified as the fix (itemized self-host TCO, capped
  tiers, EUR re-verification, year-two headroom). Applied in §2.1, §4, §8 V8.
- M11 (accessibility ungrounded): ACCEPT (ground, option a-plus-label). Reviser fetched
  WCAG 2.2 Understanding SC 1.4.10 Reflow (R04): no two-dimensional scrolling at 320
  CSS pixels width (1280 at 400% zoom) except genuinely two-dimensional parts. Reflow
  half grounded; 200% zoom minimum retained as the adopted operational proxy with the
  rest of the acceptance list (relative units, focus, keyboard, contrast). V5 preserved
  with citable thresholds. Applied in §3 P3, §5, §8 V5.
- M12 (idempotency mechanism missing): ACCEPT. §2.1 now specifies dedupe key (loan +
  cycle), log schema (loan, cycle, locale, template version, channel, status,
  state-hash), re-arm definition (return-date edit, loan-state transition, locale fix),
  and crash-safe send-records. V3 tests the mechanism including mid-batch crash rerun.
- M13 (Baserow/Directus exclusion): ACCEPT. One sentence added in §2.2 (not
  investigated in this time-box; V1 is product-agnostic and would discriminate them).
  The "only … found here" claim stays honestly bounded by the discovery set.
- M14 (verification coverage gap): ACCEPT as structural note. Q1–Q3 are valid,
  neutral, answer-free, and consequential but test challenger claims, not the primary's
  Grist-rules machinery; M15 caps the investigator at three questions, so this is not
  investigator fault. Critic's live Grist re-fetch (C01) is treated as partial
  mitigation; one Grist-rules question (cell rules on user attributes + row values,
  S-bypass prohibition, Home-vs-Document split, webhook allowlist) is routed to any
  follow-on verification. Q1–Q3 stand as written.

Minor findings: m1 reconciled with M5 (§1); m2 folded into M1 (EUR at procurement);
m3 folded into M6 (§4 Alt-2); m4 kept (Node-SDK flag, web-first avoids it); m5 kept
(Grist managed API cap as mutable, self-host unaffected); m6 kept (downtime units with
V7/unit check); m7 applied (periodic schema-rights re-check in §2.1/§5/§10); m8 kept
firm (R-P1 rejects the flat column, not phasing); m9 emphasized (V9 + bilingual re-probe
if P5 Branch 2 opens post-pilot); m10 honored (reviser IDs R01–R05 + F01–F10 are
disjoint from S and C IDs; no silent rebind).

Verifier questions:

- Q1 (NocoDB Community vs licensed, P2): CONFIRMS and STRENGTHENS the draft. Community
  lacks every finer-grained P2 control; gating confirmed at Business+/Scale+ with exact
  per-capability levels; edit-only vs visibility distinction is new material
  strengthening C-P2b. Compatible with the final; no plan correction beyond the
  strengthened correction. Proposed matrix check folded into §8 (V1 companion).
  Uncertainty retained: Google-OAuth plan gating unstated; per-record history vs
  workspace audit gating unverified — both verify-on-instance items.
- Q2 (Snipe-IT checkout/checkin + uploads, P1): CONFIRMS the draft gap with code-level
  evidence (validation rules, controller behavior, upload linkage, audit contrast, open
  issue). Compatible; P1 tracking unaffected, only per-event attachment placement
  constrained. Proposed negative/positive-control check folded into §8 (V2 companion).
  Uncertainty retained: web-UI forms may differ from API; custom-field API
  write-through unverified; upload-path wording verified per instance.
- Q3 (ERPNext fully-depreciated repair, P1): CONFIRMS the draft fix at both pinned
  tags with identical server zeroing, UX-only read-only guard, Sold/Scrapped block,
  and button presence. Compatible; repairing old instruments is expense-tracking,
  value/life uplift correctly disabled. Proposed zeroing test with positive control
  folded into §8 (V7 companion). Uncertainty retained: per-version invoice-edge
  behavior; stored-status scripting vs derived `get_status()`; accounting policy is
  outside code verification.

Disagreement adjudication: no verifier↔critic↔investigator contradiction requires a
rejection. All three packages converge: NocoDB gating (all agree, verifier strongest),
Snipe-IT gap (all agree, verifier code-deepest), ERPNext fix (all agree, verbatim +
tags), Authentik removal (draft hedged → critic official → reviser independently
confirmed), n8n figures (draft figures hold → critic multi-source → reviser official),
Lend-Engine i18n/caps (draft partial → critic live matrix → reviser independently
confirmed), Grist primary mechanics (investigator stated → critic live-confirmed → M14
gap noted with follow-on routed). Corrections in this final add evidence or scope;
nothing supported was removed except the retired Redis hedge, the over-broad Archived
invariant, and the pre-claimed $8k fit (pending V8).

## 10. Build order (pilot)

1. Provision one server with backups; install Grist; configure Home and Document
   authorization with least privilege; verify no teacher holds schema rights and
   schedule periodic re-checks for role drift.
2. Create Instruments/Schools/Loans/Repairs/RepairEvents/CaregiverContacts/Users with
   reference integrity; implement the §1 six-state repair machine (Diagnosed carries
   the awaiting-decision sub-flag) and derived availability; add per-location pilot
   flags and explicit queue-filter conventions for excluded states.
3. Build teacher issue form, coordinator triage queue (waiting-for-parts vs
   ready-for-pickup distinct), and transfer/handoff log; print inventory-room sheets.
4. Build the scheduled bilingual notifier with two reviewed templates, locale fallback,
   delivery log with the §2.1 schema, and idempotency mechanism; run V3 including the
   mid-batch crash rerun.
5. Harden identity (local + multi-factor + the §2.1 runbook covering MFA reset,
   break-glass custody/rotation, session lifetimes, provisioning); run V1 (plus the
   deployment-audit check if read-audit is kept), V2, V4 (with MFA-loss drill and
   measured triage latency), V5, V8; meet P4 exit criteria before adding schools.
6. Decide P5 branches with the district; if caregiver reporting opens, run V9 (and the
   bilingual-form probe); if broker or repair-native path is later required, run V6/V7
   on the pinned versions.

## 11. Sources and navigation

- `source-map.json` — reviser IDs R01–R05 (independent fetches) + F01–F10 (frozen
  local predecessors), exact URLs, versions, locators, access timestamps, observed
  operations. IDs immutable and disjoint from research S01–S14, verifier S01–S26, and
  critic C01–C11; no silent rebind.
- `sources/evidence.md` — bounded excerpts grounding the reviser's independent
  confirmations (n8n EUR executions, Authentik Redis removal, Lend-Engine caps +
  language rows, WCAG Reflow, Grist audit search).
- `sources/index.md` — human-navigable table of reviser sources to claims, plus the
  predecessor claim map it preserves.
- Predecessor retained evidence stays in its own stage directories (`research/sources`,
  `verifier/sources`, `critic/sources`) and was read from the declared source roots;
  this final restates all material text rather than citing IDs as substitutes.

Native route: muse. One fresh native Goal was created for this assignment and this
final plus `source-map.json` and `sources/` are saved before its terminal completion.
Unavailable fields: UNKNOWN.
