# ER11 B-08 control / research — discovery (investigator, pre-reveal)

Case I08. Method M15 v1 fresh-factored-verification-with-full-criticism, control arm.
Stage: research (investigator). Later M15 critic / reviser stages are separate; no nested agents in this stage.
Brief: `/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/cases/I08/brief.md` (read alone; plan not read).
Deadline: 2026-10-09T21:29:08.770413+00:00. Discovery frozen before plan reveal; draft after reveal corrects it.
Access timestamps in source-map.json; live docs are mutable, tagged releases are stable (drift noted per source).

## 1. Brief constraints (distilled from brief alone)

- Pool: band instruments lent across nine schools; single inventory room to start, few schools first, expand only if handoffs are clear.
- People: two music staff + part-time repair coordinator manage the pool; local teachers record urgent issues during class; family liaison needs bilingual messages; large-print screens for some teachers.
- Money/time: $8,000 this year; usable during summer when district help desk is closed (no help-desk dependency, simple recovery).
- Required record: instrument identifier, school, loan status, repair notes, expected return date, caregiver contact path when delayed.
- Privacy: student details limited because many teachers see the schedule; avoid storing grades or disciplinary data.
- Pain: binders cannot distinguish repair waiting-for-parts vs ready-for-pickup.
- Undecided (user decisions, not assumptions): who can approve a replacement instrument; whether caregivers can report a problem directly.
- Identity: existing district sign-in requirements may apply; formal integration request not funded (SSO deferred, not blocking pilot).

## 2. O1 — Useful unfamiliar tools / products and materially different approaches

Investigated from brief alone, before seeing any thin plan. Selection favors unfamiliar-to-schools open-source mechanisms over generic CRUD or per-seat SaaS.

### 2.1 Snipe-IT — checkout-centric asset management (unfamiliar fit beyond IT)

What it is: open-source web asset management (PHP/Laravel). Domain objects are assets, models, locations, users, with checkin/checkout, status meta, granular role permissions, REST API, CSV import, backups, localization.
Why unfamiliar/useful here: schools usually reach for spreadsheets or library systems; Snipe-IT already encodes lend/return, expected checkin, per-location (school) assignment, and ready/pending/archived states. Its SAML/LDAP/SCIM path directly addresses the unfunded district sign-in as a deferred migration rather than a day-one build.
Material difference vs custom CRUD: checkout is a first-class transition with history, acceptance/EULA option, and notifications (Slack/Teams, webhooks), not a status text field. Multi-company support can model schools or the pilot-vs-expanded scope.
Primary evidence: product page (S01) lists checkout/checkin, expected-checkin deadline, SAML SSO, LDAP sync, SCIM, granular permissions, 55+ languages, REST API, CSV import, one-click/cron backups. Release v8.8.0 (S02) shows checkout/checkin notification payload fixes and incomplete-checkout handling.
Applicability: instrument identifier = asset tag + serial; school = location; loan status = checkout state + status meta; expected return = expected checkin; repair notes = notes + custom fields + activity history; caregiver contact = restricted field / related user contact (must verify field-level visibility; see uncertainty).
Limits: PHP/MySQL hosting burden; summer self-recovery depends on backup/restore actually tested; permission granularity must prove teachers cannot see caregiver contact while seeing schedule.

### 2.2 InvenTree — stock-state-centric inventory with test templates (unfamiliar fit beyond electronics)

What it is: open-source inventory (Django/Python, PostgreSQL), built around Parts, StockItems, StockLocations, test templates/results, status codes, custom states, REST API + Python interface, report/label templates.
Why unfamiliar/useful here: band rooms do not think in manufacturing stock, but InvenTree cleanly separates the repairable-thing state (StockStatus + custom states) from acceptance evidence (test templates/results with attachments). That directly fixes waiting-parts vs ready-pickup: status answers where it stands, test results prove it is playable.
Material difference vs checkout-centric: state is explicit and countable (OK / Attention / Damaged / Destroyed / Lost / Rejected with Available yes/no), plus custom states that keep a logical key (e.g. OK) while showing a distinct label (e.g. Awaiting Inspection). Repair becomes a series of test results (play-test, pad seating, valve oil) with required value/attachment flags, most-recent-wins, full history retained.
Primary evidence: Part Test Templates (S03) define testable parts, test-key generation (lowercase alnum, leading underscore when digit-first), required / requires-value / requires-attachment / enabled flags, cascade to variants. Stock Test Results (S04) define template/result/value/notes/attachment, multiple results allowed, most recent determines pass/fail, API upload for automated acceptance. Stock Status + custom states (S05) define Available flag and logical-key-vs-label extension.
Applicability: instrument model = Part (trackable/testable, variants for sizes); each physical instrument = StockItem with serial in a StockLocation (inventory room / school); repair flow = status transitions + test results; waiting-parts = Damaged + open purchase/build link or custom state; ready-pickup = OK/custom Ready label + passing play-test result.
Limits: manufacturing vocabulary and Django/Postgres operations are heavier than a small pilot needs; UI/API learning curve; bilingual/liaison messaging is outside InvenTree (needs companion templates).

### 2.3 PocketBase — single-binary backend for the $8k / summer constraint (unfamiliar as pilot core)

What it is: open-source backend as a single ~12 MB executable: embedded SQLite, realtime subscriptions, built-in auth, dashboard UI, REST-ish API, Go or JavaScript extension. Collections are SQLite tables auto-generated from collection name + fields; records are rows.
Why unfamiliar/useful here: schools are offered either spreadsheets or heavy SIS modules; PocketBase gives a cheap, backup-trivial, self-hostable database + auth + API + admin UI in one process (`./pocketbase serve`), fitting $8k and help-desk-closed summer. Auth collections + API rules can enforce the teacher-vs-staff visibility split; view collections can expose a teacher-safe schedule without caregiver contact.
Material difference vs SaaS/self-host Laravel/Django: one binary, SQLite file copy as backup, no separate DB server for pilot scale; realtime for repair-board updates without extra queue; file fields for repair photos with sane defaults.
Primary evidence: intro v0.40.5 (S06) states single executable, SQLite, realtime, dashboard, REST-ish API, and pre-1.0 no-backward-compat guarantee. Auth (S07): stateless `Authorization` token, no server sessions, no logout endpoint (client `authStore.clear()`), superusers bypass API rules, OAuth2 not for superusers. Collections (S08): Base / View / Auth types; view = read-only SQL SELECT, no realtime events. Files (S09): `file` field, multipart/form-data, sanitized original name + ~10-char random suffix, default ~5 MB max adjustable with perf warning.
Applicability: collections for instruments, loans, repair events, schools, caregiver contacts (restricted), message templates (bilingual); view collection `teacher_schedule` excludes caregiver contact and student PII beyond loan-necessary; expected-return overdue = indexed date query; repair photos = file field.
Limits: pre-1.0 breaking changes (see O3); SQLite single-writer scale (fine for nine schools, not for district-wide SIS); file-size/perf tuning needed; district SSO via OIDC not verified in fetched auth doc — treat as unproven for pilot, ship local auth + documented migration.

### 2.4 Materially different approaches (kept as alternatives, not merged)

1. Checkout-centric (Snipe-IT) vs stock-state-centric (InvenTree) vs ticket-centric (repair ticket queue + asset link). Checkout optimizes lend/return handoffs; stock-state optimizes repair truth; ticket optimizes triage conversation. Pilot can start checkout + explicit repair statuses and add ticket-like notes only if handoffs stay clear.
2. Self-hosted open-source vs minimal custom CRUD on PocketBase vs per-seat SaaS (repair-shop, library, or asset SaaS). SaaS was not selected: recurring seat cost and data-residency review do not fit $8k + unfunded integration. Custom-only CRUD was not selected as first choice: it re-implements checkout/history/permissions badly under time pressure.
3. Summer/offline: (a) always-online single host with one-click/file-copy backups + printed picklists; (b) local-first PWA with queued sync (PouchDB/CouchDB or CRDTs); (c) paper fallback forms transcribed later. Discovery favors (a) for pilot: help-desk-closed means recovery must be one person + one file + one printed sheet, not a sync-conflict resolver. (b) is a real alternative if the inventory room loses connectivity; it was not deep-dived because brief says workflow must stay usable, not fully offline-editable, and sync conflicts for loan state are worse than a short outage with paper fallback.
4. Bilingual: (a) platform UI localization (Snipe-IT 55+ languages, per-user language) for staff UI; (b) curated message-template catalog in two languages with liaison review for caregiver messages. Both are needed: (a) does not translate free-text repair notes; (b) must not machine-translate delay notices without review. Liaison owns template wording; system stores language preference per caregiver contact.
5. Privacy: (a) tokenized student reference (opaque loan link, no name in schedule) vs (b) directory-information-only schedule (name + school only, with opt-out honored) vs (c) full-student-row with row-level hiding. Discovery favors (a)+(b): schedule shows instrument + school + status + dates, student identity behind staff-only view; caregiver contact in a separate restricted collection, never in the teacher view. Grades/disciplinary fields are out of schema by design, not by policy alone.

## 3. O2 — Consequential primary-source behavior, defaults, units/types, limits

### 3.1 Snipe-IT (S01, S02)

- Checkout/checkin are transitions with history; expected checkin deadline is a first-class reminder. Governance: status meta deployed / pending / ready-to-deploy / archived; pending explicitly includes out-for-repair in product copy. Default implication: waiting-parts and ready-pickup must map to distinct statuses or custom statuses, not to a notes substring, or the binder confusion recurs.
- Permissions are role-based granular; REST API and CSV import exist for migration from binders. Localization 55+ languages with per-user language supports large-print + bilingual staff UI, but caregiver message translation is separate (see 2.4).
- Identity: SAML SSO, LDAP/AD sync, Google Secure LDAP, SCIM provisioning. Default for pilot: local accounts; SSO is a documented migration gated on funded integration request. Do not promise district sign-in on day one.
- Notifications: Slack/Teams + webhooks for checkin/checkout. Caregiver contact (SMS/email) is not native; needs an explicit notification adapter with consent + language preference + audit log.
- Ops: runs on Linux/Windows/Mac web server; one-click or cron backups. Summer constraint: backup/restore must be tested by the repair coordinator alone, with a printed restore sheet.
- Limits/uncertainty: field-level visibility for caregiver phone/email against teacher schedule role was not verified in fetched product copy; must validate before claiming privacy separation. Hosting cost fits $8k only if on existing district VM or small VPS; managed Snipe-IT hosting would consume budget fast.

### 3.2 InvenTree (S03, S04, S05)

- Testable parts define test templates; templates cascade to variants. Test key = lowercase alnum derived from test name; digit-first names get a leading underscore to stay a valid Python variable (e.g. `100 Percent Test` → `_100percenttest`). Report generation references the key. Implication: test names are API; renaming breaks reports. Freeze names like `play_test`, `pad_seating`, `valve_action` before pilot.
- Template flags: required (acceptance gate), requires-value, requires-attachment, enabled. Deleting a template deletes its results; disable instead to preserve history. Implication: repair evidence policy = disable, never delete.
- Stock test results: each result links to a template; result is boolean pass/fail + optional value/notes/attachment; multiple results per test allowed, most recent wins. API/Python upload supports a repair-bench flow (record result from bench, attach photo).
- StockStatus: OK / Attention needed / Damaged / Destroyed / Lost / Rejected with Available yes/no. Custom states add label-vs-logical-key: show `Awaiting Parts` or `Ready for Pickup` while the system still counts availability correctly. This is the precise fix for the binder ambiguity: two visually distinct, countable states, not two phrases in notes.
- Units/types: serial/batch for trackable parts; stock locations form a tree (room → shelf/bin, school → music room). Expected return date is not native stock semantics; model it as a loan/checkout-side date or custom field with index, not as stock notes.
- Limits: Postgres + Django ops heavier than PocketBase; part/stock vocabulary needs a school-facing label map (Part → Instrument model, StockItem → Instrument, StockLocation → Room/School); messaging/bilingual out of scope.

### 3.3 PocketBase (S06–S09)

- Data: collections = SQLite tables auto-created; records = rows. Types: Base (any data), View (read-only SELECT, aggregations allowed, no realtime), Auth (Base + email/username identity, password, verified, tokenKey, API rules). Implication: teacher schedule = View that joins instruments + loans and omits caregiver contact + student PII; staff views = Base/Auth with rules.
- Auth: stateless token in `Authorization` header; no server sessions; no logout endpoint — logout is client token discard. Superusers ignore collection API rules and cannot use OAuth2. Implication: daily staff must not use superuser accounts; create least-privilege auth collections + rules; token theft = session theft until expiry, so short lifetimes + HTTPS + device hygiene matter. Teacher urgent-issue flow must survive token expiry gracefully during class (clear re-login, no lost draft).
- Files: `file` field, multipart upload, stored as sanitized original + random suffix (~10 chars). Default max ~5 MB per file field, adjustable with perf warning. Implication: repair photos of damage/serial plates fit; videos do not — cap count + size, thumbnails via transform, or link to district storage.
- Realtime: subscriptions for Base/Auth creates/updates/deletes; views get none. Implication: repair board can live-update from base collections; teacher schedule view refreshes on poll/re-query.
- Pre-1.0: no backward-compat guarantee; changelog + manual migrations expected. Implication: pin version (observed v0.40.5), snapshot `data.db` + `auxiliary` before any upgrade, test restore, budget one maintenance window per term.
- Scale: SQLite single file; nine schools + hundreds of instruments + thousands of loan/repair rows are well within scope. Concurrent bench + classroom writes are low; no cluster needed. Backup = file copy + PocketBase backup; restore tested by coordinator alone.

### 3.4 Accessibility — large-print screens (S10, S11)

- WCAG 2.2 SC 1.4.4 Resize Text (AA): text including labels/controls must resize to 200% without AT and without loss of content/functionality. Author duty is to not block UA scaling (relative units, no fixed heights/clipping); at least one UA scaling mechanism must work.
- WCAG 2.2 SC 1.4.10 Reflow (AA): no loss and no two-dimensional scrolling at 320 CSS px width (vertical scroll) / 256 CSS px height (horizontal scroll); 320 px ≡ 1280 px viewport at 400% zoom. Exception only for parts requiring 2D layout for usage/meaning (images, video, games, presentations, data tables but not individual cells, toolbars that must stay visible). Cells inside tables must still reflow.
- Applicability: schedule/repair-board pages must use fluid layout + Flexbox/Grid reflow, relative type, wrapping cells, sticky-but-narrow toolbars; the loan table itself may 2D-scroll as a unit on a 320-px-wide layout, but filters, actions, and detail panes must not. Large-print is not a separate theme; it is the same DOM that survives 200% text + 400% zoom.
- Discriminating check: 200% text-only zoom + 1280→320 px reflow on the teacher urgent-issue form; failure = clipped submit, overlapping date picker, or horizontal trap.

### 3.5 Privacy — limited student details, no grades/disciplinary (S12)

- PTAC/ED FAQ: directory information may be disclosed without prior consent only if the school gave public notice of what it designates as directory information, the right to restrict, and the opt-out window; honored opt-outs persist; former-student rules differ. Definition (34 CFR 99.3): information not generally considered harmful or an invasion of privacy if disclosed. Citations observed: 34 CFR 99.31(a)(11), 99.37, 99.3.
- Applicability: the schedule seen by many teachers must contain at most instrument + school + loan/repair state + dates, plus at most directory-information the district has designated and the family has not opted out of. Grades and disciplinary data are never directory information in any sane designation and are out of schema entirely. Caregiver contact for delay notices is not student directory information; it needs its own collection, consent/notice basis, and staff-only access.
- Governing unknown: the district's actual directory-information designation + opt-out list were not observed and cannot be assumed. Pilot must ask for them and default to tokenized/minimal display until provided. Liaison bilingual notices should include the opt-out explanation.
- Retention/destruction: studies/contractor clause (99.31(a)(6)) and PTAC sanitization guidance point to defined retention + secure deletion for retired records/devices; pilot stores retention rule per collection (loan history vs contact) even if enforcement is manual at first.

## 4. O3 — Issue / fix / regression / release chains (with absent-evidence notes)

### 4.1 Snipe-IT checkout notification + incomplete-checkout fixes (observed, S02)

Release v8.8.0 notes (fetched tag page) include a checkout/checkin webhook notification payload fix tied to FD-57297 / PR #19655 with added tests for checkout and checkin payloads, plus better handling of incomplete checkouts for non-users. Releases index context shows an ongoing PHP floor evolution (8.2+ required, 8.4+ recommended; older lines required 7.x). Chain reading: checkout is the highest-churn path; notification payloads have regressed and been fixed with tests; upgrades are coupled to runtime upgrades. For I08 this means: pin + test checkout/expected-checkin/notify on every upgrade; treat notification content as a contract with its own tests (especially caregiver-delay wording); budget PHP/runtime maintenance inside $8k.
Absent: no I08-specific instrument or school-tenancy bug was sought or claimed; no fix is asserted beyond what the release notes state.

### 4.2 PocketBase pre-1.0 breaking-change evolution (observed, S06 + changelog context)

Intro doc (S06, v0.40.5) explicitly warns full backward compatibility is not guaranteed before v1.0 and production-critical use requires reading the changelog and applying manual migrations. Changelog search context shows a v0.23.0 breaking-change warning and a v0.40.0 console-error-propagation note flagged as slight breaking for chained commands. Chain reading: upgrades are intentionally breaking-capable; migrations are code (Go/JS) plus data snapshot discipline. For I08 this means: pin exact version, snapshot before migrate, keep a restore-tested copy, and do not auto-update during term or summer. The risk is manageable for a small pilot precisely because the data file is one SQLite DB.
Absent: no specific PocketBase auth-bypass or data-loss regression is asserted; none was independently verified in this stage.

### 4.3 InvenTree status → custom-states evolution (observed, S05)

StockStatus enum (OK/Attention/Damaged/Destroyed/Lost/Rejected + Available) is the stable core; custom states add labeled overlays with a logical key so `Awaiting Parts` vs `Ready for Pickup` can be distinct, countable, and availability-correct without forking the enum. Chain reading: the project learned that real shops need local labels that do not break availability math. For I08 this is the cleanest precedent for the binder fix: adopt custom states over free text from day one.
Absent: no specific InvenTree regression or CVE is asserted; none was needed for the planning decision.

### 4.4 Bilingual messaging + offline sync (evidence absent / inapplicable as release chains)

No issue/fix chain is claimed for liaison message translation or PWA sync, because discovery did not select a sync framework or translation vendor as pilot core. Stating absence honestly: translation quality and sync-conflict behavior are not release-gated here; they are procedure-gated (liaison-reviewed templates; paper fallback + single-host backups). If a later stage selects a sync library or SMS gateway, it must supply its own fix/regression chain.

## 5. Retained synthesis for planning (conditions, alternatives, uncertainty)

### 5.1 Minimal pilot record (proposed, survives either checkout or stock core)

- Instrument: `instrument_id` (asset tag, unique, printed label) + `serial` (manufacturer, nullable) + `model_ref` + `home_room` + `current_school`.
- Loan: `loan_status` enum (`available`, `checked_out`, `issue_reported`, `in_triage`, `waiting_parts`, `in_repair`, `ready_pickup`, `retired`) + `expected_return_date` (date, nullable) + `school` + `student_ref` (opaque token; staff-only join to minimal student link) — never grades/disciplinary.
- Repair: append-only `repair_events` (timestamp, actor role, from→to status, notes, photo refs); never overwrite; waiting-parts and ready-pickup are statuses with counts/filters, not adjectives in notes.
- Caregiver contact: separate restricted collection (`caregiver_contact_id`, `student_ref`, `channel`, `address`, `language_pref`, `consent_basis`, `opt_out`), staff-only; teacher schedule view excludes it by construction (View/SQL projection, plus API-rule denial).
- Message templates: `delay_notice`, `ready_pickup`, `parts_waiting` in two languages, liaison-owned, versioned; free-text repair notes are never auto-translated for caregivers.

### 5.2 Repair state machine (pilot)

`checked_out` → `issue_reported` (teacher, <60 s during class) → `in_triage` (staff/coordinator) → `waiting_parts` | `in_repair` → `ready_pickup` → `checked_in`/`checked_out`. Every transition is an event with actor + timestamp + note + optional photo. Waiting-parts shows parts-needed + ordered date; ready-pickup shows pickup location + hold-until date. Counts and filters are first-class; the board answers the binder question at a glance.

### 5.3 Pilot scope and expansion gate

Start: one inventory room + 2–3 schools, two staff + coordinator + a few teachers + liaison. Gate to nine schools: (a) urgent-issue capture during class succeeds without training; (b) waiting-parts vs ready-pickup counts match physical shelves on audit; (c) teacher view provably excludes caregiver contact + non-directory student data; (d) backup/restore performed by coordinator alone; (e) 200%/320-px checks pass on schedule + issue form; (f) bilingual delay/ready templates sent and understood. Do not expand on anecdote; expand on these checks.

### 5.4 Summer / $8k / SSO conditions

- Summer: single host + file/one-click backups + printed restore sheet + printed picklists; no district help-desk ticket in the critical path; no auto-updates June–August.
- $8k: existing district VM preferred; else small VPS + domain + backups (<$500/yr) + labels/printer + contingency; no per-seat SaaS in pilot; version pins + one maintenance window per term inside staff time.
- SSO: ship local auth with strong passwords + MFA where the platform supports it; document SAML/OIDC migration (Snipe-IT SAML/LDAP/SCIM path observed; PocketBase OIDC unproven in fetched docs) gated on funded integration request. Do not block pilot on SSO.

### 5.5 User decisions explicitly preserved (not decided by discovery)

- Who approves a replacement instrument (role + threshold: staff vs coordinator vs principal; value/condition triggers).
- Whether caregivers report problems directly (portal request vs email/phone triage vs no direct intake) and what acknowledgment SLA applies.
- District directory-information designation + opt-out list; caregiver contact consent basis and retention.
- Second language choice + liaison review workflow; whether staff UI also localizes or only caregiver messages.

### 5.6 Disagreement and uncertainty retained

- Checkout-centric vs stock-state-centric core is a real tradeoff; discovery does not force it. Either can carry the pilot if the repair statuses are explicit and privacy views are proven. Choice should follow hosting capacity (PHP/MySQL vs Python/Postgres vs single-binary SQLite) and who will maintain it in summer.
- Field-level privacy in Snipe-IT and OIDC/SSO in PocketBase were not verified in fetched primary docs; both are marked uncertain and must be validated or designed around (separate restricted collection + view).
- No performance, security-audit, or load evidence is claimed; scope is a small product pilot, not production guarantees. No runtime was available in this stage; checks below are proposed unless noted executed.

## 6. O6 — Validations: executed vs proposed (discriminating)

Executed in this research stage: primary-doc fetches and behavior extraction only (S01–S12 per source-map). No application runtime, no sandbox witness, no checkout/repair flow executed. No billing/usage observed (null).

Proposed discriminating validations for build/pilot (each fails a real alternative):

1. Privacy projection: as teacher role, query schedule + attempt direct caregiver-contact read; pass = contact 403/absent in every path including API, export, and search. Fails a naive single-table design.
2. Repair-state audit: seed 20 instruments across waiting-parts / in-repair / ready-pickup; physical shelf count must equal filtered counts; notes-only phrasing must not affect counts. Fails free-text status.
3. Overdue query: instruments with `expected_return_date < today` and `loan_status != available` must list with school + days-overdue + staff-only contact link; teacher view shows delay flag without contact. Fails date-as-text.
4. Urgent-issue capture: teacher records issue during class in <60 s on a classroom device, with re-login after expired token losing no draft. Fails heavyweight ticket forms.
5. Accessibility: 200% text resize (S10) + 320-px reflow / 400% zoom (S11) on schedule, issue form, and repair board; no clipped submit, no 2D trap outside the table unit. Fails fixed-pixel layouts.
6. Bilingual: liaison sends delay + ready-pickup templates in both languages to test contacts; rendering + language preference honored; free-text notes never auto-sent as translated. Fails machine-translation shortcut.
7. Summer recovery: coordinator alone restores from backup to a fresh host/VM from the printed sheet, then completes a checkout + issue + ready-pickup cycle. Fails help-desk-dependent ops.
8. Pilot gate audit (5.3 a–f) before expanding beyond initial schools. Fails anecdote-driven rollout.

## 7. Method note

Investigator-complete. Critic and reviser are later M15 stages. Draft (post-reveal) will dispose every exact P clause as correction / optional enhancement / user decision / already-covered / rejected / uncertain, retaining alternatives, conditions, and uncertainty in one self-contained final.
