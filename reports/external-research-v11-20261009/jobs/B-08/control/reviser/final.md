# ER11 B-08 control / reviser — final (I08, M15 v1)

Case I08: school-district band instrument lending + repair across nine schools.
Method M15 v1 fresh-factored-verification-with-full-criticism, control arm, reviser stage.
Brief investigated alone by investigator; discovery frozen before plan reveal
(P1–P6 revealed 2026-10-09T21:04Z); draft disposed each P clause; critic
independently re-fetched (C01–C06) and returned M1–M14 plus m1–m12.
This reviser independently re-fetched six primary sources (R01–R06, see
`source-map.json` and `sources/evidence.md`) to adjudicate consequential
criticisms, then authored this ONE coherent complete final covering O1–O6 and
every exact P clause. Predecessor IDs (S01–S12, C01–C06, R01–R06) locate
evidence only; every material claim below is stated in full prose.

Disposition vocabulary: correction (plan direction needs a substantive fix),
correction (partial) (direction partly stands, fix required), already-covered
(needs no change), optional enhancement (useful, not required), user decision
(district must choose), rejected (considered, set aside with reason),
uncertain (cannot be settled on current primary evidence).
Criticism verdicts use: accept (critic right, final changed), amend (critic
partly right, final changed with modification), reject (critic wrong on
evidence), uncertain (cannot be settled, carried as open question).

## 0. Brief constraints (preserved)

Pool of band instruments lent across nine schools; start with one inventory
room and a few schools, expand only if handoffs are clear. Two music staff
plus a part-time repair coordinator manage the pool; local teachers record
urgent issues during class; family liaison needs bilingual caregiver
messages; some teachers use large-print screens. Budget $8,000 this year.
Workflow must stay usable in summer with the district help desk closed.
Record needs: instrument identifier, school, loan status, repair notes,
expected return date, caregiver contact path when delayed. Student details
limited (many teachers see the schedule); no grades or disciplinary data.
Binder pain: cannot tell repair waiting-for-parts from ready-for-pickup.
Undecided: who approves a replacement instrument; whether caregivers may
report problems directly. District sign-in requirements may apply; formal
integration request not funded.

## 1. O1 — Tools, products, materially different approaches

### 1.1 Snipe-IT — checkout-centric asset management

Open-source web asset management (PHP/Laravel). Domain objects are assets,
models, locations, users, with checkin/checkout transitions, status meta,
role permissions, REST API, CSV import, backups, localization. Schools
usually reach for spreadsheets or library systems; Snipe-IT already encodes
lend/return, expected checkin deadline, per-school location assignment, and
deployed / pending / ready-to-deploy / archived states (product copy places
out-for-repair under pending). Checkout is a first-class transition with
history, optional acceptance/EULA, and Slack/Teams plus webhook
notifications — not a status text field. Identity path observed: SAML SSO
login, LDAP/AD sync, Google Secure LDAP, SCIM provisioning — a deferred
migration, not day-one build. Staff-UI localization observed: 55+ languages
with per-user language. Limits: PHP/MySQL hosting; field-level visibility
for caregiver contact against a teacher schedule role was not verified in
fetched product copy (carried as uncertain, P2 gate); custom-status
availability for waiting-parts vs ready-pickup asserted from marketing copy
only, needs verification before the Snipe path claims the binder fix.

### 1.2 InvenTree — stock-state-centric inventory with test templates

Open-source inventory (Django/Python, PostgreSQL): Parts, StockItems,
StockLocations, test templates/results, status codes, custom states, REST
API plus Python interface, report/label templates. The stock-state view
separates repairable-thing state from acceptance evidence. Stable released
docs (re-verified by this reviser, R05/R06, stable docs dated August 22,
2026) state the stock status table as OK / Attention needed / Damaged all
Available Yes, and Destroyed / Lost / Rejected / Quarantined Available No,
where Quarantined means intentionally isolated and unavailable. Custom
states are display-only overlays: every custom state maps to an existing
built-in state (its logical key) and the system uses that built-in state
for availability counts, order transitions, and filtering; the example
given is logical key OK with label Awaiting Inspection, counted available
but visually distinct. Test templates: testable parts define named tests
with required / requires-value / requires-attachment / enabled flags;
test keys are lowercase alphanumeric derived from the name (digit-first
names get a leading underscore to stay a valid Python variable) and are
referenced by reports, so names freeze before pilot; deleting a template
deletes its results, so the policy is disable-never-delete. Test results:
boolean pass/fail plus optional value/notes/attachment, multiple results
allowed with most-recent-wins and full history kept, uploadable via API or
Python interface. Limits: manufacturing vocabulary needs a school-facing
label map; Django/Postgres operations heavier than a single binary;
bilingual caregiver messaging is outside InvenTree.

### 1.3 PocketBase — single-binary backend for the $8k/summer constraint

Open-source backend as a single ~12 MB executable: embedded SQLite,
realtime subscriptions, built-in auth, dashboard UI, REST-ish API, usable
as Go framework or standalone application started with `./pocketbase
serve` (observed version v0.40.5). Collections are SQLite tables
auto-generated from collection name plus fields; records are rows. Three
collection types: Base (any data), View (read-only SQL SELECT, supports
aggregations, receives no realtime events because it has no
create/update/delete operations), Auth (Base plus identity/password,
verified, tokenKey, API rules). Auth is stateless: a client is
authenticated while it sends a valid Authorization token header; there are
no server sessions and no logout endpoint — logout is client token discard.
Superusers bypass all collection API rules and cannot use OAuth2. Files:
file fields with multipart upload, stored as sanitized original name plus
a ~10-character random suffix, default maximum ~5 MB per file field,
adjustable with a performance warning for large files. API rules
(re-verified R01): five per collection (list, view, create, update, delete)
plus a manage rule on auth collections; each rule is locked/null
(superuser-only, the default), empty string (public), or a non-empty filter
expression; an unsatisfied list rule returns 200 with empty items, an
unsatisfied create rule returns 400, unsatisfied view/update/delete rules
return 404, and locked rules return 403 to non-superusers. OAuth2
(re-verified R02): the same auth page exposes Authenticate with OAuth2 for
named providers (Google, GitHub, Microsoft, etc.) with provider-app Client
Id/Secret and a redirect URL of the form
`https://yourdomain.com/api/oauth2-redirect`. Pre-1.0: full backward
compatibility is not guaranteed before v1.0; production-critical use
expects changelog reading plus manual migrations. Limits: SQLite
single-writer scale (fine for nine schools); generic-OIDC coverage beyond
named OAuth2 providers, district-IdP compatibility, and claims/group
mapping to pilot roles are unverified; view-collection API-rule
enforcement detail (list/view rules on views, whether the view SQL can
leak underlying-table data) needs a primary-doc confirmation before the
pilot claims exclusion by construction.

### 1.4 Materially different approaches (retained)

Checkout-centric (Snipe-IT) vs stock-state-centric (InvenTree) vs
ticket-centric triage layered on either: checkout optimizes lend/return
handoffs, stock-state optimizes repair truth, ticket optimizes triage
conversation. Self-hosted open-source vs lean PocketBase core vs per-seat
SaaS: SaaS is rejected for the pilot on recurring seat cost plus
data-residency review against $8k and unfunded integration; custom-only
CRUD is not first choice because it re-implements checkout, history, and
permissions badly under time pressure. Summer/offline: always-online
single host with tested backups plus printed picklists (chosen for pilot)
vs local-first PWA with queued sync (deferred: sync conflicts for loan
state are worse than a short outage with paper fallback) vs paper fallback
forms transcribed later. Bilingual: platform UI localization for staff UI
plus a liaison-owned versioned template catalog in two languages for
caregiver messages; neither replaces the other, and free-text repair notes
are never machine-translated into caregiver notices. Privacy: tokenized
student reference plus directory-information-only schedule plus a separate
restricted caregiver-contact collection; grades and disciplinary fields
are absent from the schema by design, and free-text smuggling gets an
input guard (see P2).
Omitted (not rejected): library-circulation systems (the most school-native
alternative) and any concrete ticket product were never investigated; the
ticket-centric path was investigated by name only. A later stage may
evaluate them, but this final makes no claim about them.

## 2. O2 — Consequential behavior, defaults, units, limits

Checkout/checkin are transitions with history and an expected-checkin
deadline; waiting-parts and ready-pickup must be distinct countable
statuses, never phrases in notes. Availability is derived from status by
query, so a repair transition automatically removes the instrument from
the loanable set. Expected return is an indexed nullable date, not text;
overdue means expected_return_date strictly before today in the
district/school timezone (recorded at pilot setup; date-vs-datetime and
null-means-no-deadline fixed in the schema) with status not available.
Instrument identity is a unique printed asset tag plus nullable
manufacturer serial; tag format/symbology/size is fixed at pilot setup
with large-print legibility (human-readable tag alongside any
barcode/QR). Repair photos fit the ~5 MB-per-file default with an explicit
count cap (pilot default: at most 3 photos per repair event); videos do
not fit and link to district storage instead. Teacher schedule views omit
caregiver contact and non-directory student data by projection and deny
direct reads by rule; daily staff never use superuser accounts because
superusers bypass all rules. Token expiry during class is a designed flow:
the urgent-issue form keeps a local draft, offers clear re-login, and
resumes without data loss; the token mechanism itself does not preserve
drafts. Large-print survival: WCAG 2.2 normative Success Criterion 1.4.4
Resize Text (Level AA) requires that text other than captions and images
of text be resizable without assistive technology to 200% without loss of
content or functionality; Success Criterion 1.4.10 Reflow (Level AA)
requires presentation without loss and without two-dimensional scrolling
at 320 CSS px width (vertical scroll) / 256 CSS px height (horizontal
scroll) except for parts requiring two-dimensional layout for usage or
meaning, with 320 px equivalent to a 1280 px viewport at 400% zoom.
Concretely: fluid Flexbox/Grid layout, relative type, wrapping cells; the
loan table itself may scroll in two dimensions as one unit on narrow
layouts, and filters/actions in a must-stay-visible toolbar may share that
exception, but cells inside tables must still reflow and detail panes must
not trap the user. Directory information: appropriately designated
directory information (information not generally considered harmful or an
invasion of privacy if disclosed, 34 CFR 99.3) may be disclosed without
prior consent only under 34 CFR 99.31(a)(11)/99.37 after public notice of
the designation, the right to restrict disclosure, and the opt-out window;
timely opt-outs must be honored; the former-student rule (99.37(b))
applies only to alumni/outgoing-student loans and is otherwise retained
but inapplicable. Caregiver contact is not student directory information
and needs its own consent/notice basis, language preference, and
staff-only access.

## 3. O3 — Issue/fix/regression/release chains

Snipe-IT v8.8.0 (stable tag, independently confirmed by critic and
retained): the release notes record a checkout/checkin webhook
notification payload fix (FD-57297 / PR #19655, with added tests for
checkout and checkin webhook payloads) plus better handling of incomplete
checkouts for non-users, against a PHP floor of 8.2+ required and 8.4+
recommended. Chain reading: checkout/notify is the highest-churn path and
upgrades couple to runtime upgrades, so every upgrade pins versions and
re-tests checkout, expected checkin, and notify. The recommendation to
treat notification content as a contract with its own tests is sound
advice but an inference, not a chain reading: the added tests cover
webhook payload shape, not caregiver wording. PocketBase pre-1.0
evolution: downgraded to a fetched single-point warning plus honest
absence. The v0.40.5 no-backward-compat warning (read the changelog, apply
manual migrations) is fetched and sufficient as a planning input; the
version-to-version claims about v0.23.0 and v0.40.0 came from search
context, not a fetched changelog, and no multi-release chain is claimed.
Planning consequence stands: pin the exact version, snapshot before
migrate, restore-test, never upgrade during term or summer. InvenTree
status to custom-states: the temporal evolution narrative ("the project
learned") is withdrawn — it was read from two synchronic documents with no
before/after releases, changelog, or migration note. What stands is the
stable-behavior precedent (R05/R06): a versioned status table with an
Available flag plus display-only custom states mapped to a logical key.
No I08-specific bug is claimed for any product. No translation-vendor,
sync-framework, or SMS/email-gateway chain is claimed because none was
selected; selecting a caregiver channel later obligates a chain for the
chosen channel.

## 4. O4 — Per-P comparison (exact clauses, dispositions, criticism verdicts)

### P1: "Track instrument assignment, reported issue, repair state, expected return, and availability for loan."

Disposition: correction (partial). The direction stands; four fixes are
required to satisfy the brief, plus one optional enhancement. Core choice
remains uncertain among three paths.

Retained: the pilot record carries instrument identifier (asset tag plus
manufacturer serial), current school, loan status, append-only repair
notes with history, expected return date, and availability for loan.
Repair history is an append-only event log (timestamp, actor role,
from-to status, note, optional photo); nothing is overwritten.

Correction 1 — repair state must be explicit countable statuses, not
adjectives in notes. Waiting-parts shows parts-needed plus ordered date;
ready-pickup shows pickup location plus hold-until date; both are
filterable with shelf-matching counts.
Correction 2 — availability is derived from status by query, not stored
as free text; a repair transition automatically removes the instrument
from the loanable set.
Correction 3 — expected return is an indexed nullable date with fixed
timezone and null semantics; the overdue list (before today and not
available) with school plus days-overdue is a first-class query.
Correction 4 — urgent classroom capture is a pilot target with method:
median under 60 seconds over observed classroom captures after a short
(about 5-minute) orientation, with draft survival across re-login and no
data loss; the gate also passes on completion-without-data-loss plus
staff-observed burden if the timing sample is too small to judge.
Optional enhancement — acceptance evidence via test templates (named
tests such as play_test and pad_seating with required / requires-value /
requires-attachment flags; boolean pass/fail plus value/notes/attachment;
most-recent-wins with full history kept; disable-never-delete):
ready-pickup requires the latest play-test pass plus photo, and the final
states explicitly that a later pass hides an earlier fail in the headline
(latest-pass rule); variant cascade is noted inapplicable to unique
instruments; template names freeze before pilot under a named owner (the
repair coordinator); bench burden is estimated at pilot setup and
revisited at the expansion gate.
Uncertain — checkout-centric vs stock-state-centric vs lean custom core.
All three remain viable only if the corrections above hold and the
per-path privacy/approval checks pass; the choice follows hosting
capacity and summer maintainership. Domain-mismatch honesty: Snipe-IT
asset-to-user checkout vs the student-plus-caregiver-plus-school triad,
InvenTree fungible stock vs per-student loans with expected return, and
the unnamed ticket layer all need mapping work at build time.

### P2: "Limit student and caregiver details to staff who need them for a loan or repair handoff."

Disposition: correction (partial). Structural separation is the right
direction; the oracle, retention, and Snipe-path claims are fixed below.

Retained: the schedule seen by many teachers shows at most instrument
plus school plus loan/repair state plus dates, plus at most what the
district has designated as directory information for families that have
not opted out. Grades and disciplinary data are absent from the schema.
Correction 1 — separation by construction. Student identity behind the
schedule is an opaque token with a staff-only join; caregiver contact
lives in a separate restricted collection (channel, address, language
preference, consent/notice basis, opt-out) that the teacher schedule
view cannot reach. Concretely on the PocketBase path: a read-only view
projection omits contact plus non-directory student data, and API rules
deny direct reads with the corrected oracle — unsatisfied list returns
200 with empty items, unsatisfied view/update/delete returns 404, and
403 appears only for locked (superuser-only) rules. Intended rule set
(build requirement): caregiver-contact collection locked or
staff-filtered (teachers get 200-empty on list and 404 on view; locked
collections give 403); teacher schedule view exposes list/view rules for
teacher roles with contact columns absent from the SELECT; staff
collections use authenticated-role filter expressions; daily staff never
use superuser accounts. View-collection rule enforcement (list/view
rules on views, no leakage via underlying tables) must be confirmed in
primary docs before the pilot claims exclusion by construction. The
privacy validation scope is the named surfaces (page, API, export,
search, admin dashboard) plus a residual-risk note for backups, logs,
browser cache, and printed picklists, each with its handling rule.
Correction 2 — caregiver contact is not student directory information
and needs its own basis, per the confirmed PTAC account (public notice,
right to restrict, opt-out window, honored opt-outs).
Retention — the unevidenced retention-period and secure-deletion claims
are withdrawn to an open question: the district retention schedule plus
destruction method for loan history vs contact records is to be
supplied; the interim standard is manual-with-audit-log, dated and
owned, reconciled explicitly (structural enforcement for access from day
one; manual-with-log for retention only until the district schedule
lands). User decisions — the district's directory-information
designation plus current opt-out list, and the caregiver-contact
consent/notice basis plus retention, must be supplied; until provided
the pilot defaults to tokenized/minimal display, and the liaison
workflow includes the opt-out explanation in both languages.
Uncertain — Snipe-IT field-level contact visibility is unverified, so
the Snipe-IT path fails P2 until the teacher-cannot-see-contact check
passes; if it fails, contact stays in a companion restricted store.
Usability honesty: opaque tokens make every teacher delay-chase a
staff-mediated lookup; the pilot defines a teacher-safe identifier
(instrument plus school plus delay flag, no student name) and designs
the staff-only join placement and key management at build time.
Free-text repair notes can smuggle grades/disciplinary content into
prose, so the form carries an input guard (brief reminder plus staff
review of flagged notes), since absent columns do not stop prose.

### P3: "Provide large-print friendly screens and caregiver messages that can be prepared in two languages."

Disposition: correction (partial). Resize/reflow substance stands;
platform baseline, normative citation, template lifecycle, and channel
cost are fixed below.

Correction 1 — large-print is survival of standard scaling, not a theme.
Normative WCAG 2.2 SC 1.4.4/1.4.10 (Level AA) plus the confirmed
Understanding substance govern: 200% text resize without loss; reflow at
320 CSS px / 400% zoom without two-dimensional scrolling except
two-dimensional-required parts; cells inside tables still reflow. The
expansion gate scopes to custom surfaces (schedule, issue form, repair
board) and adds platform-UI accessibility as a core-selection criterion:
each candidate platform UI is baselined against the same resize/reflow
check before selection, so a platform failure is discovered at selection
rather than at gate time. Contrast, focus visibility, keyboard
operability, and print styles for picklists are explicit checklist items
on the same validation; a pilot may scope to resize/reflow only with a
written rationale, but the default is the wider check.
Correction 2 — bilingual caregiver messages are a liaison-owned
versioned template catalog in two languages (delay_notice,
ready_pickup, parts_waiting plus opt-out explanation) with per-contact
language preference, approval ownership, a fallback when preference is
missing (send the district-default language plus the second language,
or hold for liaison choice — fixed at pilot setup), and an inbound
reply path in both languages. Free-text repair notes are never
machine-translated into caregiver notices. Channel selection (SMS vs
email vs paper) is a costed user decision with per-option estimates
recorded before pilot: SMS per-message segmentation/encoding depends on
language choice (which affects cost), email needs deliverability and
consent handling, paper needs print/distribution handling. The second
language is therefore both a user decision and a technical input.
Optional enhancement — staff-UI localization via the platform is
Snipe-only (ships 55+ languages with per-user language) and helps staff
only; it does not translate caregiver messages, needs coverage
verification once the second language is chosen, and the template
catalog is still required. User decisions — second language, liaison
review workflow and template-approval ownership, staff-UI localization
scope, channel choice, inbound-reply handling.

### P4: "Support a small pilot that starts with one inventory room and selected schools."

Disposition: correction (partial) — gating is the correction.
Retained: one inventory room plus 2–3 schools, two music staff plus
part-time repair coordinator plus a few classroom teachers plus the
family liaison; printed asset tags and shelf/bin locations are part of
the pilot. Pilot-school selection criteria are recorded at setup
(one near the inventory room, one far, one with a large-print teacher
or high repair volume) to avoid selection bias. Expansion to nine
schools requires all of: (a) urgent-issue capture meets the P1 target
(median under 60 s after brief orientation, draft survives re-login;
or completion-without-data-loss with acceptable burden); (b)
waiting-parts vs ready-pickup filtered counts match a physical shelf
audit on live pilot data (seeded counts only to bootstrap; sampling
rationale recorded — pilot default is a full shelf audit of the pilot
room, not a fixed seed number); (c) the teacher view provably excludes
caregiver contact and non-directory student data on every named path
plus the residual-risk note; (d) the repair coordinator alone performs
backup plus restore to a named fresh host from the printed sheet and
then completes a checkout-to-ready-pickup cycle, where the backup lives
off-host with a named custodian and path, the fresh-host source and
summer provisioning time are named and funded, and printed sheets carry
only minimal data with a shredding rule; (e) 200% text resize plus
320-px reflow / 400% zoom pass on schedule, issue form, and repair
board (custom surfaces) with the platform baseline already done at
selection; (f) bilingual delay plus ready templates are sent in both
languages and the comprehension check passes (liaison-observed
comprehension plus caregiver acknowledgment on test contacts, owned by
the liaison). Partial expansion is allowed: a missed gate blocks only
the schools or workflows it affects, with a dated remediation path;
full expansion needs all gates. Rejected as gate criteria: anecdotal
liking, raw login counts, ticket volume. Transport/logistics for the
one-room-to-nine-schools physical handoff (waiting-parts intake,
ready-pickup distribution) is part of the gate evidence, not assumed.

### P5: "Replacement approval and direct caregiver reporting are district program decisions."

Disposition: user decision — the plan correctly defers both; this final
attaches build requirements so the decision is informed and enforceable.
Replacement approval options: role (music staff vs repair coordinator
vs principal/designee) times threshold (value, condition, loan-history
triggers) times record (approval event in the repair log with approver
plus reason). The system represents approval as an explicit event and
enforces it at a named per-core point (build requirement with a
negative test on every path): Snipe role/permission check, InvenTree
permission/transition check, PocketBase collection rule expression plus
event-hook transition guard; until the point is demonstrated, the
requirement is marked per-core-TBD and the pilot must not let any
authenticated user mark an instrument replaced/retired. Direct
caregiver reporting options: (a) no direct intake — caregivers
call/email, staff transcribe (simplest, keeps triage quality); (b)
structured request form (limited fields, no account) creating an
un-triaged request staff accept or decline; (c) authenticated caregiver
portal requests. Each option carries abuse controls,
identity/reset burden, queue separation, and an acknowledgment SLA with
an owner reconciled to part-time capacity: (b) needs enumeration/IDOR,
spam/rate-limit, and queue separation so un-triaged caregiver requests
never bury teacher urgent issues; (c) needs identity proofing without
district SSO (unfunded) plus a password-reset burden that falls on two
staff plus a part-time coordinator, including summer with the help desk
closed. Recommendation owned with a revisit trigger: start with (a),
add (b) only if triage stays clear and the abuse/SLA analysis passes;
(c) only with funded identity support. No correction to the deferral
shape: assuming an answer would be the planning risk.

### P6: "The sign-in approach and any district system integration are not yet funded."

Disposition: correction (partial). Local-auth-now with a documented
migration is right; OIDC framing, MFA/roles, summer scope, and
messaging cost are fixed below.
Retained: no district sign-in integration in the pilot. Ship local
accounts with a documented password policy plus lockout per platform
docs, least-privilege roles, and no shared superuser for daily work.
MFA is marked to-be-determined per core (no MFA source was fetched for
any core) — the pilot ships password policy plus lockout and records
MFA support as a selection criterion, not a promise. Role-times-
capability matrix is a build requirement with the enforcement point
named per core (Snipe role permission, PocketBase collection rule,
InvenTree permission) or marked per-core-TBD until demonstrated.
Correction — the migration is documented, not improvised. Snipe-IT's
observed path (SAML SSO login, LDAP/AD sync, Google Secure LDAP, SCIM
provisioning) is the reference for a funded follow-up. On the
PocketBase path the accurate state is mechanism-confirmed but
mapping-unverified: named OAuth2 providers including Google and
Microsoft exist on the fetched auth page with Client Id/Secret plus
redirect URL, so if the district identity is Google Workspace or
Microsoft Entra the path may be short; what remains unverified is
generic-OIDC coverage beyond named providers, district-IdP
compatibility, and claims/group mapping to pilot roles. The pilot
documents local-auth-now plus the district-IdP question as an open
item. The district's own sign-in requirements document (password,
complexity, MFA, session rules) is requested up front; the migration
is planned toward known requirements, not unknown ones. Summer
condition: no district help-desk ticket in the critical path
June–August. Single host plus off-host backups (named location,
custodian, path) plus printed restore sheet plus printed picklists with
minimization and shredding; a manual-upgrade freeze window (no upgrades
June–August and none during term without snapshot plus restore-test);
version pins (observed PocketBase v0.40.5; Snipe-IT requires PHP 8.2+,
8.4+ recommended) with one maintenance window per term. The
no-backward-compat warning before v1.0 stands: every upgrade is
snapshot, migrate, restore-test. $8k condition: existing district VM
preferred; otherwise a small VPS plus domain plus backups
(hundreds/year) plus labels/printer plus contingency, with the
caregiver channel costed separately per the P3 channel decision. Staff
time (two staff plus part-time coordinator plus liaison template
review) is outside the $8k unless the district states otherwise; the
pilot records which reading applies. No per-seat SaaS in the pilot.
Rejected: blocking the pilot on a funded SSO decision; sharing one
admin login; upgrading the backend during the school year or summer
freeze.

## 5. Criticism verdicts (every finding, explicit)

Material: M1 amend — the contradiction was real on the evidenced table
(Damaged/Available-Yes cannot carry waiting-parts; Destroyed/Lost/
Rejected carry wrong semantics), but stable re-verification found
Quarantined (intentionally isolated, Available No) as a neutral
non-available logical key, so both waiting-parts and ready-pickup can
share it with distinct labels. New honesty: stable docs say custom
states are display-only and filtering uses the logical key, so separate
filterability/countability of two customs on one key is unverified;
the InvenTree path is viable only if that filtering is verified or a
companion field carries the split, and the explicit-status requirement
stands as platform-agnostic design. M2 accept — S05 mixed provenance
(search snippet plus master doc) cannot carry the binder fix or an O3
chain; both behaviors re-verified against stable docs (R05/R06) and the
evolution narrative withdrawn. M3 accept — the 403 oracle was wrong;
rewritten per rule type (200-empty on list, 404 on view, 403 only for
locked), intended rule set shown, view-rule verification added. M4
accept — OAuth2 mechanism confirmed on the same page (named providers,
Client Id/Secret, redirect URL); restated as
mechanism-confirmed/mapping-unverified with the district-IdP question
added; generic-OIDC coverage remains unverified. M5 accept — retention
periods and destruction methods withdrawn to an open question naming
the district schedule; interim standard reconciled as
manual-with-audit-log, dated and owned. M6 accept — MFA dropped to
per-core-TBD with password-plus-lockout now; role matrix required per
core with enforcement points or marked TBD. M7 accept — 60 seconds
relabeled as a measured pilot target with orientation allowed and a
completion-without-loss alternative; draft survival stated as
application behavior, not a token property. M8 accept — backup
locality/custodian, fresh-host source, paper minimization/shredding,
and manual-freeze reframing all added. M9 accept — channel costed as a
separate user decision, language-encoding consequences recorded, staff
time placed outside $8k by default. M10 accept — per-core approval
enforcement points plus negative tests required, marked TBD until
demonstrated. M11 accept — P1/P2/P3/P4/P6 relabeled correction
(partial); already-covered reserved for clauses needing no change; the
Snipe P2 path marked failing until verified. M12 accept with scoping —
normative SC text cited (R04), gate scoped to custom surfaces with
platform baseline as selection criterion, wider large-print items added
with an explicit narrow-scope option. M13 accept — per-option
abuse/identity/SLA analysis attached, part-time capacity reconciled,
(a)-first owned with a revisit trigger. M14 accept via the allowed
downgrade — PocketBase chain reduced to the fetched single-point
warning plus honest absence of a multi-release chain.
Minor: m1 accept (latest-pass semantics, cascade inapplicability,
owner, burden estimate added); m2 accept (teacher-safe identifier,
join design, notes input guard added); m3 accept (toolbar exception
acknowledged); m4 accept (staff localization labeled Snipe-only with
coverage check); m5 accept (partial expansion, selection criteria,
comprehension metric/owner added); m6 accept (validation scope named
plus residual-risk note); m7 accept (timezone, null, tag format,
photo count cap fixed); m8 accept (domain mismatch stated, library
and ticket alternatives recorded as omitted); m9 accept (notification
contract labeled inference); m10 accept (former-student rule applied
narrowly, otherwise retained-but-inapplicable); m11 accept (future
channel selection obligates a chain); m12 accept (live-audit default
with recorded rationale replaces the fixed seed number).
Omissions: (1) district sign-in requirements requested as a document;
(2) physical transport/logistics added to gate evidence; (3) part-time
capacity reconciled per SLA; (4) inbound replies and
preference-fallback designed; (5) ticket/library alternatives recorded
as omitted. Confirmed K1–K5 (Snipe chain, PocketBase auth/collections,
PTAC account, reflow substance) are preserved unchanged except where
the verdicts above narrow them.

## 6. O5 — Retained synthesis (self-contained)

Minimal pilot record: instrument (unique printed tag plus nullable
serial plus model reference plus home room plus current school); loan
(status enum: available, checked_out, issue_reported, in_triage,
waiting_parts, in_repair, ready_pickup, retired; plus expected return
date, school, opaque student reference); repair as append-only events;
caregiver contact in a separate restricted collection with language
preference and consent/opt-out; message templates versioned in two
languages, liaison-owned. State machine: checked_out to issue_reported
(teacher, pilot target above) to in_triage (staff/coordinator) to
waiting_parts or in_repair to ready_pickup to checked_in/checked_out,
every transition an attributable event; waiting-parts and ready-pickup
are statuses with counts and filters, never phrases in notes.
Alternatives, conditions, disagreement, and uncertainty from sections 1
and 4 are part of this synthesis, not appendices. Open user decisions:
replacement approver role plus thresholds; caregiver reporting option
plus SLA; directory-information designation plus opt-out list and
contact consent/retention; second language plus liaison workflow plus
channel choice plus inbound handling; hosting placement within $8k;
core selection following maintainer capacity; district sign-in
requirements document; district identity provider for the SSO path.
Uncertainty retained: core choice; Snipe contact visibility and
custom-status availability; PocketBase view-rule enforcement,
generic-OIDC, and claims mapping; InvenTree custom-state separate
filterability; retention schedule; MFA support; no performance,
security-audit, or load evidence claimed — scope is a small product
pilot, not production guarantees.

## 7. O6 — Validations: executed vs proposed

Executed in this reviser stage: independent primary-doc re-fetches and
behavior extraction only (R01–R06 per source-map.json, excerpts in
sources/evidence.md, index in sources/index.md). No application
runtime, no sandbox witness (none qualified/available), no
checkout/repair flow executed, no code run. Usage/billing unobserved
(null). No runtime-available claims. Proposed discriminating
validations for build/pilot (each fails a real alternative):
(1) privacy projection — teacher role queries the schedule and
attempts direct caregiver-contact reads; pass is 200-empty on list,
404 on view, 403 only on locked collections, on page, API, export,
search, and admin dashboard, plus the residual-risk note;
(2) repair-state audit — live pilot shelf counts equal filtered
waiting-parts/in-repair/ready-pickup counts under the corrected
availability mapping; notes phrasing cannot affect counts;
(3) overdue query — expected_return_date before today in the recorded
timezone and status not available lists school plus days-overdue plus
staff-only contact link; teacher view shows the delay flag without
contact; null means no deadline;
(4) urgent-issue capture — median under 60 s over observed classroom
captures after brief orientation including re-login after expired
token with no lost draft, or completion-without-loss with acceptable
burden;
(5) accessibility — 200% text resize plus 320-px reflow / 400% zoom on
schedule, issue form, and repair board with no clipped submit and no
two-dimensional trap outside the table unit (plus toolbar exception),
contrast/focus/keyboard/print checklist, platform baseline already
done at selection;
(6) bilingual — liaison sends delay plus ready templates in both
languages to test contacts; preference honored, fallback exercised,
comprehension checked by liaison observation plus acknowledgment, free
text never auto-sent as translated, inbound replies handled;
(7) summer recovery — coordinator alone restores from the named
off-host backup to the named fresh host from the printed sheet, then
completes checkout-to-ready-pickup; paper minimization/shredding
observed;
(8) approval negative test — non-approver attempts to mark
replaced/retired and is denied on every path; approval event recorded
with approver plus reason;
(9) role-matrix check — each role's allowed/denied capabilities
demonstrated at its enforcement point;
(10) retention handling — district schedule recorded or interim
manual-with-log demonstrated with dates and owner;
(11) pilot gate audit (P4 a–f with partial-expansion rule) before any
expansion. No proposed validation is presented as executed.

## 8. Method note

Reviser-complete under M15 v1 control (fresh full reviser after fresh
full investigator and fresh full critic; no nested agents in this
stage). O1 (tools plus different approaches with omitted alternatives
named), O2 (primary-source defaults/limits/applicability with
corrected oracles, types, and normative citations), O3 (chains with
downgrades and honest absence), O4 (per-P dispositions above with
every criticism explicitly verdict), O5 (self-contained synthesis
retaining alternatives, conditions, disagreement, uncertainty), O6
(executed vs proposed validations separated) are all addressed from
the brief, predecessor evidence, revealed P1–P6, the full critique,
and six independent reviser re-fetches.
