# I08 draft — band instrument lending + repair coordination (post-reveal planning deliverable)

Block B-08 / treatment / research / case I08 / method M15 v1 investigator.
Brief: `cases/I08/brief.md` (frozen sha256 ff13f85a…). Revealed plan: `revealed-plan.md` (P1–P6 exact, see §1).
Discovery (`discovery.md` + `source-map.json` + `sources/`) frozen before reveal via `reveal-plan.py`; not rewritten after.
No runtime available. O6 separates executed doc checks from proposed validations. Usage/billing null where unobserved.

## 1. Exact revealed plan (verbatim)

- P1: Track instrument assignment, reported issue, repair state, expected return, and availability for loan.
- P2: Limit student and caregiver details to staff who need them for a loan or repair handoff.
- P3: Provide large-print friendly screens and caregiver messages that can be prepared in two languages.
- P4: Support a small pilot that starts with one inventory room and selected schools.
- P5: Replacement approval and direct caregiver reporting are district program decisions.
- P6: The sign-in approach and any district system integration are not yet funded.

Disposition vocabulary (O4): correction (plan underspecified or wrong and must change), optional enhancement (compatible addition), user decision (district must choose, both branches buildable), already-covered (plan + discovery agree, no change), rejected (discovery alternative not pursued with reason), uncertain (evidence absent or mutable, validation required).

## 2. Recommended scope (self-contained)

### 2.1 Primary recommendation: Grist pilot + asynchronous bilingual notifier + deferred identity broker

For the single-inventory-room + few-schools pilot, self-host Grist as the system of record, with tables for Instruments, Schools, Loans, Repairs, RepairEvents, CaregiverContacts, and Users. Model repair as an explicit state machine with at least Intake, Diagnosed, Waiting-for-Parts, In-Repair, Ready-for-Pickup, Closed. Waiting-for-Parts blocks availability for loan; Ready-for-Pickup does not auto-loan and requires an explicit handoff. Track expected return as a date on the Loan; overdue is defined as today past expected return while still checked out. Record availability as a derived value from loan + repair state, never as a free-text flag.

Enforce student/caregiver minimization in Grist content access rules (table/column/cell formulas on user attributes and row values), not in user-interface hiding alone. Teachers see schedule, instrument identifier, school, loan status, and repair state, but not caregiver phone/email unless the delay workflow needs it. Coordinators and the family liaison see contact details. Never grant schema permission to teachers or liaison, because schema permission bypasses all other restrictions. Keep Home-database workspace sharing and Document content rules both configured; sharing a document without content rules exposes protected details to all viewers.

Send caregiver delay messages through a separate scheduled workflow (self-hosted n8n or equivalent) that scans overdue loans once per cycle, looks up caregiver locale, renders one of two human-reviewed templates, sends via email first, logs delivery, and retries idempotently. Do not machine-translate at send time. When locale is missing, fall back to the liaison’s primary language and flag for human follow-up. Batch the scan into one execution per cycle rather than one execution per loan.

Start identity with local accounts plus multi-factor authentication and a printed recovery runbook the liaison can execute while the district help desk is closed. Defer district single sign-on until funded. If single sign-on is needed before funding, add a self-hosted identity broker (Authentik) federating the district provider once and issuing standard tokens to the lending app, with break-glass local admins and database backups. Do not promise district sign-in without a funded integration and a claim-mapping test.

Operate the pilot on one small virtual server or district virtual machine with automated backups. Print handoff sheets for the inventory room so summer operation does not depend on the help desk. Expand from one room to more schools only when the handoff log shows clean transfers, overdue detection works, and the repair queue correctly distinguishes waiting-for-parts from ready-for-pickup.

This primary path fits the $8,000 annual cap as self-hosted software plus server and backup costs, with email-based notifications. Short-message costs, if short messages are later required, need separate validation for carrier opt-in and per-message price.

### 2.2 Why this primary, and what would change it

Grist is chosen over a generic spreadsheet-database because its access rules evaluate per row, column, and cell on user attributes and row values, which is the only low-code mechanism found here that directly implements “many teachers see the schedule but not student/caregiver details” without a paid tier. The competing spreadsheet-database requires a paid license for table/field-level permissions, teams, audit logs, and row-level security, which makes its community edition unsuitable for that constraint unless the license is funded.

The separate notifier is chosen because lending-record systems do not natively provide locale-aware bilingual delay templates with delivery logging and idempotent retry. A scheduled workflow does that portably across record systems.

Deferred identity is chosen because the brief and P6 both state integration is unfunded. A broker adds a critical path that must be maintained during summer closure; local accounts with a liaison-executable runbook are more resilient for a pilot.

This primary would change to the ERPNext alternative if the district needs native parts consumption, downtime accounting, and replacement-approval workflow rather than a lending log; to the dedicated lending-service alternative if the district prefers a hosted lending-native product and accepts software-as-a-service dependence plus bilingual and field-visibility validation; to the asset-lifecycle alternative if barcode asset discipline and exclusive checkout are more important than per-event repair evidence; or to an offline-sync build only if field testing proves in-class capture must write while fully offline.

## 3. O4 — Exact per-P disposition

### P1: Track instrument assignment, reported issue, repair state, expected return, and availability for loan.

Disposition: already-covered in intent; correction on repair-state semantics and availability derivation; optional enhancements for labels and parts; one uncertainty on per-event attachments.

Already-covered: instrument assignment (who has which instrument), reported issue capture (teacher urgent report during class), repair state tracking, expected return date, and availability for loan are all required and retained. No clause is dropped.

Correction C-P1a (required): “repair state” must be an explicit enumeration including at least Intake, Diagnosed, Waiting-for-Parts, In-Repair, Ready-for-Pickup, Closed. The brief’s core pain is that binders cannot distinguish waiting-for-parts from ready-for-pickup; a free-text or two-state field repeats that failure. Waiting-for-Parts must block availability; Ready-for-Pickup must not auto-loan and must require explicit handoff to a borrower or room.

Correction C-P1b (required): “availability for loan” must be derived from loan exclusivity plus repair state, not stored as an independent editable flag. An instrument checked out to one borrower cannot be checked out to another until checked back in. An instrument in Waiting-for-Parts, In-Repair, or Diagnosed-awaiting-decision is not available even if no loan row exists. An Archived-equivalent state must never be used for active repairs or items vanish from queues.

Correction C-P1c (required): “expected return” is a date on the loan; “overdue” is today past expected return while still checked out. Overdue detection runs server-side on the record system, not on offline clients, so summer or disconnected capture does not miss delays.

Retained findings: exclusive checkout prevents double-booking replacement instruments; unique instrument identifier per system (serial reused as identifier or auto-increment, with school as a location/relation rather than baked into the identifier so cross-school transfers do not break uniqueness); repair notes plus file evidence per repair event; location model with an explicit unavailable repair/cleaning location so items under repair cannot be lent.

Optional enhancement E-P1a: barcode/QR labels for the inventory room (asset-tag style) to speed intake, handoff, and audit. Compatible with any record system; labels encode the instrument identifier only, never student data.

Optional enhancement E-P1b: parts-aware repair (only if ERPNext path chosen): record consumed parts so cost is included and inventory reduced through the supported repair workflow; record downtime and possible capitalization per repair. Do not model waiting-for-parts as a planned-maintenance log; planned maintenance and failure repair are distinct.

Uncertain U-P1: per-event attachment pinning on the asset-lifecycle path. The asset-lifecycle checkout/checkin programming interface accepts only text fields (assignee, location, type, status, note, name, expected return), while file uploads attach to the asset globally rather than to a specific checkout/checkin log entry. That gap is open with no fix observed. If the pilot needs damage photos pinned to a specific loan/repair event via that interface, choose the Grist file-column-per-repair-row, lending-service repair-upload, or ERPNext repair-attachment path instead, and validate pinning survives the next loan.

Rejected R-P1: spreadsheet “status” column with no state machine and no availability derivation. Rejected because it preserves the binder failure and permits double-booking.

### P2: Limit student and caregiver details to staff who need them for a loan or repair handoff.

Disposition: already-covered in intent; correction on enforcement layer and on the unsuitable community path; uncertainty on portal field redaction.

Already-covered: store only instrument identifier, school, loan status, repair notes, expected return, and a caregiver contact path for delays; keep student details minimal; store no grades or disciplinary data. Many teachers see the schedule; only handoff-necessary staff see student/caregiver details.

Correction C-P2a (required): enforce by content-level rules, not interface hiding. Teachers with schedule access must be denied caregiver phone/email and extended student fields at the data-rule layer, with coordinator and liaison granted. Interface filtering alone is insufficient because API, exports, and connected apps bypass it.

Correction C-P2b (required): do not use the community spreadsheet-database path for this constraint without its paid license. Its community/unlicensed tier defaults programming tokens to all-resources access with no expiry, shows the token only once, and gates table/field-level permissions, row-level security, teams, audit logs, and single sign-on to a paid tier. Workspace-level separation is now available to self-host, but that does not redact columns or rows for many-teacher visibility. If that product is chosen, fund and verify the license and re-test redaction; otherwise use the Grist content-rule path or a portal with verified field permissions.

Retained conditions: least-privilege sharing (grant only needed tables/rows/columns; scopes restrict and never expand what the authorizing user can do); no owner-level programming keys on teacher devices (prefer scoped, revocable integrations); no schema/structure permission for teachers or liaison; audit who viewed caregiver contact; overdue notifier reads contacts server-side and never exposes the full contact table to teachers.

Uncertain U-P2a: caregiver-portal field redaction on the ERPNext/lending-service paths. Portal scope can implement “caregivers see only their own rows,” but no captured evidence proves field-level portal visibility per row for this schema. Validate with two caregivers and two students before enabling direct caregiver access.

Uncertain U-P2b: exact license cost and audit-log retention for the gated spreadsheet-database tier. Pricing and license boundaries are mutable; re-verify at procurement. Treat earlier list prices as non-binding.

Rejected R-P2: “one shared login for all teachers” and “hide columns in the view.” Both rejected: the first destroys audit and least privilege; the second is bypassable via API/exports.

### P3: Provide large-print friendly screens and caregiver messages that can be prepared in two languages.

Disposition: already-covered in intent; correction on what “large-print friendly” and “two languages” mean as buildable requirements; uncertainty on hosted lending-service bilingual behavior.

Already-covered: some teachers use large-print screens; the family liaison needs messages in two languages. Both retained as release-blocking acceptance, not nice-to-have.

Correction C-P3a (required): “large-print friendly” is a platform requirement, not an app theme. Build with relative type units, reflow at 200% browser zoom without clipped text or horizontal scrolling to complete loan, repair-queue, and issue-form tasks, visible focus indicators, keyboard-only operability, and sufficient contrast. Fixed-pixel canvas or table widgets that clip at large sizes fail. No captured product provides a distinct “large-print mode”; the requirement is met by layout and style discipline plus testing with operating-system large text and browser zoom.

Correction C-P3b (required): “two languages” means two human-reviewed message templates selected by caregiver locale, with explicit fallback and delivery logging — not machine translation at send time and not ad-hoc staff translation per message. Repair notes remain in the staff working language; the caregiver message is a liaison-approved summary in the caregiver’s language. Missing locale falls back to the liaison’s primary language and flags for human follow-up. Duplicate sends on retry are suppressed by idempotency (one overdue loan notified once per cycle unless state changes).

Retained conditions: locale stored per caregiver contact; template versions reviewed by the liaison; overdue scan batched (one scheduled run scanning all loans, not one run per loan) so hosted automation caps do not exhaust; email first; short messages only after opt-in, sender-identity, and per-message cost validation.

Uncertain U-P3: whether the hosted lending-service natively supports two-locale message templates and per-caregiver locale selection. No captured page confirms it. If that path is chosen, validate template locale, fallback, and reminder idempotency before committing.

Rejected R-P3: automatic translation of repair notes or delay notices at send time. Rejected for mis-communication risk on return dates, pickup instructions, and liability-adjacent repair language.

### P4: Support a small pilot that starts with one inventory room and selected schools.

Disposition: already-covered; optional enhancements for enablement, transfers, and exit criteria; no correction to the pilot-first direction.

Already-covered: begin with a single inventory room and a few schools; expand only if handoffs are clear. Retained exactly. Pilot scope is one room, two to three schools, the two music staff, the part-time coordinator, a small teacher group, and the liaison.

Optional enhancement E-P4a: per-location enablement. Model schools and storage/repair locations as data, with a pilot flag per school/location. Non-pilot schools see a read-only “coming soon” or no access rather than a broken half-workflow. Unavailable repair/cleaning locations are first-class so items under repair cannot be reserved.

Optional enhancement E-P4b: transfer/handoff log. Every movement between room, school, borrower, and repair location writes who handed to whom, when, and in what state, with expected return carried or reset explicitly. Expansion is gated on this log being complete and legible, not on anecdote.

Optional enhancement E-P4c: pilot exit criteria (all must pass before adding schools): overdue detection fired correctly for two weeks; waiting-for-parts vs ready-for-pickup never confused in the queue; teacher urgent-report to coordinator triage completed within one school day in the pilot; no caregiver contact exposed to out-of-scope teachers in the redaction probe; large-print pass on the three core screens; backup/restore demonstrated from documentation without helpdesk help.

Rejected R-P4: nine-school big-bang launch. Rejected as incompatible with “expand only if handoffs are clear” and with summer low-support operation.

Uncertainty: none material on P4 direction; scale costs (hosting, automation runs, short messages) remain to be measured in the cost probe.

### P5: Replacement approval and direct caregiver reporting are district program decisions.

Disposition: user decision (both items); no correction; both branches preserved as configuration with stated consequences.

User decision D-P5a: who can approve a replacement instrument. Branch 1: coordinator or music staff approves (fast, low overhead, suitable for pilot). Branch 2: district program owner approves (slower, auditable, suitable if replacements carry budget or equity implications). Either branch is implementable as an approval role plus a replacement-request state (Requested, Approved, Denied, Fulfilled). The choice changes queue design and notification recipients but not the record schema. No default is assumed; the pilot runs with an explicit interim approver documented as interim until the district decides.

User decision D-P5b: whether caregivers can report a problem directly. Branch 1 (closed): only staff/teachers file issues; caregivers contact the liaison, who files. Lower moderator load, lower portal-exposure risk. Branch 2 (open): caregivers file through a scoped portal showing only their own loans, with coordinator triage before repair creation. Higher convenience, higher need for portal redaction validation, spam/abuse handling, and bilingual form strings. Both branches use the same issue-to-repair triage (urgent report becomes a tracked issue, coordinator creates or links a repair draft, technician assignment and expected downtime recorded). The brief’s “have not decided” is preserved; the build does not bake in one branch.

Conditions retained: whichever branch is chosen, the repair state machine, overdue logic, minimization rules, and pilot exit criteria do not change. Direct caregiver reporting, if opened later, requires re-running the portal-redaction probe and the bilingual-form probe before go-live.

No rejection: neither branch is rejected. No uncertainty beyond the district’s pending choice.

### P6: The sign-in approach and any district system integration are not yet funded.

Disposition: already-covered; correction that unfunded means no promised integration; optional enhancement for a broker path with explicit summer-operations cost.

Already-covered: existing district sign-in requirements may apply, but a formal integration request has not been funded. No district integration is promised in the pilot. No grade, discipline, or roster sync is built.

Correction C-P6a (required): treat “may apply” as a validation gate, not a build task. The pilot ships with local accounts, multi-factor authentication, least-privilege roles, and a printed recovery runbook executable by the liaison without the help desk (password resets, break-glass admin, backup/restore, session handling). District sign-in is a funded follow-on with a claim-mapping test (at minimum mailbox, given name, surname, and any employee/department attributes the record system expects), not a configuration toggle.

Optional enhancement E-P6a (only if pre-funding single sign-on is required): self-hosted identity broker federating the district provider once and issuing standard sign-in tokens or directory binds to the lending app, with proxy sessions for apps lacking native sign-in. Since the reported 2025.10 simplification the broker needs only its database (no separate cache service), reducing moving parts. Broker configuration includes explicit server address, port/scheme, certificate validation, base/bind distinguished names for directory binds, and attribute maps for single sign-on. Edge must block forged identity headers so only the broker can assert identity. This path adds a critical service that must survive summer closure with long-lived sessions, break-glass admins, and tested database restore. Cost is server plus domain/certificates plus admin time; no per-user fee was observed.

Uncertain U-P6: the exact district provider (education workspace vs directory), required claim set, and whether directory bind or modern token sign-in will be accepted. Also the broker version pin needs re-verification at build freeze because the simplification note was captured from guides rather than pinned release notes. Re-verify before promising the broker topology.

Rejected R-P6: building roster/grade/discipline sync or enrolling in a paid directory-integrationSKU during the pilot. Rejected as out of scope, unfunded, and incompatible with data minimization.

## 4. O1 — Alternatives retained (do not collapse to identifiers)

Four buildable alternatives plus two infrastructure choices are retained with the conditions under which each wins.

Alternative 1 — Asset-lifecycle record system (Snipe-IT style). Strengths: unique asset tags, exclusive checkout preventing double-booking, four-behavior status labels, label printing, programming interface for checkout/checkin with expected return, directory/single-sign-on settings. Wins when barcode discipline and exclusive loans matter most and repair can be modeled as statuses plus notes. Loses on per-event repair evidence via programming interface (text-only checkout/checkin; uploads attach globally, open gap) and on teacher field redaction (role/field visibility not proven at field level). Needs the same bilingual notifier and large-print discipline as the primary.

Alternative 2 — Hosted lending-native service (Lend-Engine style). Strengths: lending vocabulary (reservations, renewals, reminders, member self-serve), maintenance schedules (ad-hoc or after every loan), multi-location with unavailable repair/cleaning locations, repair assignment with notes/uploads, list pricing within budget on all tiers with unlimited loans. Wins for fastest time-to-pilot and lowest admin burden. Loses on software-as-a-service dependence during summer closure (needs export, service-level understanding, and an offline urgent-capture fallback), on unconfirmed bilingual template behavior, and on unconfirmed field-level member-data visibility. Validate all three before committing.

Alternative 3 — Full repair-native planning system (ERPNext/Frappe style). Strengths: only path with native planned-maintenance vs failure-repair distinction, consumed-parts inventory reduction with cost, downtime and capitalization handling, issue-to-repair draft triage with technician assignment and expected downtime, portal, and translations. Since the v15/v16 repair releases, repairs work for fully depreciated assets with capitalization locked off — the normal school-instrument case. Wins when parts, downtime, replacement approvals, and portal/i18n are all required. Loses on operational weight (application server, database, background workers, domain knowledge) for a two-staff pilot; fits $8,000 only with existing infrastructure or a small server plus volunteer admin.

Alternative 4 — Community spreadsheet-database on existing relational database (NocoDB style). Strengths: familiar grid over Postgres/MySQL, fast tables/views, workspace separation now in self-host, unlimited records/seats as reported. Wins when the district already runs a relational database and wants a grid front end. Loses decisively on P2 without a paid license (field/column/row redaction, teams, audit, single sign-on gated), and community tokens default to all-resources with no expiry. Only viable for minimization if the license is funded and redaction re-tested.

Infrastructure choice A — Offline-sync engine (PowerSync style over Postgres). Real offline writes with local SQLite reads, row-partitioned sync rules per school, real-time streaming when connected. Wins only if in-class capture must write with no connectivity. Costs: sync service, logical replication, client build, sync-rule security review, conflict design for concurrent loan/return, and no peer-to-peer local-network sync when fully offline. For most pilots, a simpler “online form plus queued outbox with explicit queued-vs-sent labels” suffices; server-side overdue scans remain authoritative.

Infrastructure choice B — Automation runner for notifications (n8n style). Self-hosted unlimited runs; hosted tiers cap monthly runs (Starter ~2,500, Pro ~10,000 as reported, mutable). Wins as the portable bilingual notifier across any record choice. Must batch scans; license is free for internal self-hosted business use with restrictions on resale/embedding. Short-message delivery still needs opt-in and cost validation.

Disagreement retained: low-code primary vs repair-native completeness. The primary optimizes for pilot speed, minimization without a license, and summer operability. The repair-native path optimizes for parts/downtime/portal/i18n correctness at higher operational cost. Both are buildable; the cost and redaction probes discriminate.

## 5. O2 — Governing behavior carried into the build

- Loan exclusivity and availability derivation (§3 P1) are invariants, not conventions. Double-booking is prevented by state, and availability is computed.
- Repair states Waiting-for-Parts (blocks loan) and Ready-for-Pickup (requires handoff) are mandatory and visually distinct in every queue, filter, and export.
- Expected return is a date; overdue is computed server-side daily; the notifier is idempotent per loan per cycle.
- Minimization is enforced at the data-rule layer with least privilege; programming keys are scoped and revocable; schema/structure rights are admin-only; contact access is audited.
- Webhook/callback targets from a self-hosted record system are allowlisted by domain; unlisted targets fail closed rather than silently dropping notifications.
- Directory/single-sign-on bindings pin server, port/scheme, certificate validation, base/bind names, and attribute maps; missing mailbox claim breaks sign-in rather than creating a broken profile.
- Sync rules, if offline sync is built, filter every row by school/tenant from validated claims, never from client-supplied values; offline writes show queued vs synced; coordinator queues never depend on offline clients.
- Units: downtime in minutes at entry and hours in analysis where that product is used; repair service-levels in days; expected return as calendar date. Mixed units are a defect.
- Large-print and bilingual rules from §3 P3 are acceptance gates, not styling suggestions.

## 6. O3 — Evolution chains carried into the build

- Fully-depreciated repair fix (applicable, retained): the repair-native product’s v15/v16 releases allow repair records for fully depreciated assets with capitalization locked and no value/life change. School instruments are routinely fully depreciated, so this fix is what makes that path viable. Verify the depreciation-error path (error log plus notification to the configured role or account managers) does not block repair submission.
- Checkout/checkin attachment gap (open, retained): the asset-lifecycle programming interface remains text-only for checkout/checkin, with uploads attaching globally rather than per event. No fix observed. Do not promise per-event photo pinning on that path.
- Workspace separation now in self-host (partial, retained): the community spreadsheet-database’s 0.301.5-equivalent release brings workspace access control to self-host with existing access preserved, but field/row redaction remains gated. The O4 correction on P2 stands.
- Broker simplification (reported, re-verify): the identity broker no longer requires a separate cache service since the reported 2025.10 change, needing only its database. Fewer summer moving parts, but re-verify the pin at build freeze.
- Offline upload buffering (documented behavior, retained): the sync engine calls its upload routine only while the sync stream is connected; offline writes buffer indefinitely and preview tests cover only local behavior. Design queued-vs-sent labels around it; no fix is expected.

Where evidence was absent (hosted lending-service bilingual/PII fields, portal field redaction, short-message pricing/opt-in, broker version pin, managed API caps), the draft states uncertainty and assigns a validation rather than assuming an answer.

## 7. O5 — Constraints, conditions, and uncertainty (single coherent final)

Original constraints preserved: $8,000 annual cap; nine schools eventual, pilot-first; two music staff plus part-time coordinator plus in-class teacher capture; summer operation without the help desk; six-field record plus caregiver contact on delay; minimal student data, no grades/discipline; large-print; two-language caregiver messages; explicit waiting-for-parts vs ready-for-pickup; undecided replacement approver and caregiver direct reporting; unfunded sign-in/integration.

Conditions: pilot-first with per-location flags and a transfer log; content-rule minimization; human-reviewed bilingual templates with fallback; local-accounts-plus-runbook identity until funded; server-side overdue detection; print fallback for the inventory room; expansion only on exit criteria.

Uncertainty (validation-bound, §8): hosted-service bilingual/PII behavior; portal field redaction; short-message cost/opt-in; broker version pin and district claim set; managed API caps and license pricing drift; per-event attachment pinning on the asset path. None blocks the primary pilot; each blocks the alternative or enhancement it guards.

## 8. O6 — Validations: executed vs proposed

Executed (documentation reads only, 2026-10-09T21:00–21:10Z; no code run, no container started, no login tested, no accessibility tool run):
- Asset-lifecycle overview (status behaviors, exclusivity, identifiers).
- Checkout/checkin attachment gap issue (open, text-only + global uploads).
- Relational low-code access rules, self-host webhook allowlist, Home vs Document authorization, schema-bypass and key-scoping guidance.
- Spreadsheet-database token defaults, collaboration precedence, workspace-release note, and license-gating report.
- Repair-native maintenance-vs-repair docs, repair-with-parts/downtime docs, and fully-depreciated repair releases.
- Broker self-host/integration/proxy patterns and simplification report.
- Sync-engine intro, upload-only-while-connected behavior, offline-read guarantee, backend/SDK matrix, and no-local-network-sync limit.
- Lending-service features/pricing and automation execution/license/pricing notes.

Proposed (discriminating, small-scope; each can falsify a choice; none has run):
- V1 Field-redaction probe (P2): two schools × two instruments × two students with caregiver contacts; Teacher-A (School-A) must not read School-B rows or any caregiver phone/email, while coordinator can. Falsifies record-system choice and rule configuration.
- V2 Repair-state probe (P1): move one instrument through Intake → Waiting-for-Parts (loan blocked) → Ready-for-Pickup (handoff required) → Checked-out; attach damage evidence via the intended interface and prove it remains pinned to that repair after the next loan. Falsifies state machine and attachment path.
- V3 Overdue bilingual probe (P1/P3): set two overdue loans with different caregiver locales; run the notifier once; prove exactly two messages, correct locale, logged delivery, no duplicate on rerun, and fallback with human flag when locale is missing. Falsifies batching, templating, idempotency.
- V4 Summer-closure probe (brief/P4/P6): disable helpdesk-dependent recovery for a day; prove teacher urgent capture still works (online, or queued with an explicit queued label), coordinator triage completes, sessions survive, and break-glass admin plus backup/restore work from the printed runbook. Falsifies hosting/identity/offline choice.
- V5 Large-print probe (P3): operating-system large text plus 200% browser zoom on schedule, repair queue, and issue form; prove no clipped text, no horizontal scrolling to finish tasks, visible focus, keyboard-only completion. Falsifies layout/style approach.
- V6 Broker probe, only if broker chosen (P6): federate a test district-like provider; prove token, assertion, directory-bind, and proxy paths; prove forged-header rejection, certificate enforcement, and database-restore recovery. Falsifies broker topology.
- V7 Depreciation-repair probe, only if repair-native chosen (P1/O3): fully depreciate a test asset; prove repair submits with capitalization locked and no value/life change, and that a depreciation posting error does not block repair. Falsifies that path’s applicability.
- V8 Cost probe (brief): twelve-month total (hosting, licenses, messages, backup, admin hours) at nine-school scale against $8,000 with year-two renewal headroom. Falsifies hosted-vs-self-host and message-channel choices.
- V9 Portal probe, only if caregiver direct reporting is opened (P5): two caregivers each see only their own loans, file in both languages, and cannot enumerate other students; coordinator triage still gates repair creation. Falsifies portal scope and bilingual-form readiness.

No proposal is reported as run. “No runtime available” is the honest executed state.

## 9. Build order (pilot)

1. Provision one server with backups; install Grist; configure Home and Document authorization with least privilege; verify no teacher holds schema rights.
2. Create Instruments/Schools/Loans/Repairs/RepairEvents/CaregiverContacts/Users with reference integrity; implement the six-state repair machine and derived availability; add per-location pilot flags.
3. Build teacher issue form, coordinator triage queue (waiting-for-parts vs ready-for-pickup distinct), and transfer/handoff log; print inventory-room sheets.
4. Build the scheduled bilingual notifier with two reviewed templates, locale fallback, delivery log, and idempotency; run V3.
5. Harden identity (local + multi-factor + runbook); run V1, V2, V4, V5, V8; meet P4 exit criteria before adding schools.
6. Decide P5 branches with the district; if caregiver reporting opens, run V9; if broker or repair-native path is later required, run V6/V7.

Later stages may correct this draft with primary evidence; corrections must preserve the per-P dispositions, alternatives, and uncertainty above rather than silently dropping them.
